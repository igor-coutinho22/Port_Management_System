using System.Diagnostics;
using System.Net.Http.Headers;
using System.Text;
using System.Text.RegularExpressions;
using WebApp.Models.Domain.Scheduling;
using WebApp.Models.Domain.Scheduling.Services;

namespace WebApp.Models.Application.Services.Scheduling
{
    public class HeuristicScheduleService : IHeuristicScheduleService
    {
        private const string PrologCommandName = "swipl"; // must be in PATH

        private readonly string _prologFilePath;
        private readonly HttpClient _httpClient;
        private readonly ILogger<HeuristicScheduleService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private bool _prologChecked;

        public HeuristicScheduleService(
            IHttpClientFactory httpClientFactory,
            ILogger<HeuristicScheduleService> logger,
            IConfiguration configuration,
            IHttpContextAccessor httpContextAccessor)
        {
            _logger = logger;
            _httpClient = httpClientFactory.CreateClient("DomainBackend");
            _httpContextAccessor = httpContextAccessor;

            _prologFilePath = Path.Combine(
                AppContext.BaseDirectory,
                "Models", "Domain", "Scheduling", "heuristic_schedule.pl");
        }

        public async Task<SchedulingResult> GenerateDailyScheduleAsync(
            DateOnly targetDate,
            string heuristicName,
            CancellationToken cancellationToken = default)
        {
            EnsurePrologAvailable();

            var heuristicAtom = NormalizeHeuristicName(heuristicName);
            ValidateHeuristic(heuristicAtom);

            var stopwatch = Stopwatch.StartNew();

            // 1) Fetch approved visits for the selected day via REST
            var visits = await GetVisitsForDateAsync(targetDate, cancellationToken);

            if (!visits.Any())
            {
                return new SchedulingResult
                {
                    HeuristicName = heuristicAtom,
                    TotalDelayMinutes = 0,
                    RuntimeSeconds = 0,
                    Entries = new List<VesselScheduleEntry>(),
                    Warnings = new List<string> { "No vessel visits for selected date." }
                };
            }

            // 2) Build Prolog facts & ID map
            var (vesselFacts, idMap) = BuildPrologVesselFacts(visits, targetDate);

            // 3) Run specific heuristic
            var (seqLine, delayLine) =
                await RunPrologAsync(vesselFacts, heuristicAtom, cancellationToken);

            // 4) Parse the sequence returned by Prolog
            var entries = ParseSeqTripletsLine(seqLine, idMap, targetDate);

            // 5) Parse total delay
            if (!double.TryParse(delayLine, out var totalDelay))
                throw new InvalidOperationException($"Could not parse delay value from Prolog: '{delayLine}'");

            stopwatch.Stop();

            return new SchedulingResult
            {
                HeuristicName = heuristicAtom,
                TotalDelayMinutes = totalDelay,
                RuntimeSeconds = stopwatch.Elapsed.TotalSeconds,
                Entries = entries,
                Warnings = new List<string>()
            };
        }


        #region Prolog Availability Check (Option A)

        private void EnsurePrologAvailable()
        {
            if (_prologChecked) return;

            if (!IsCommandAvailable(PrologCommandName))
            {
                throw new InvalidOperationException(
                    $"SWI-Prolog command '{PrologCommandName}' not found in PATH. " +
                    "Install SWI-Prolog and ensure 'swipl' is available in the system PATH.");
            }

            _prologChecked = true;
        }

        private static bool IsCommandAvailable(string commandName)
        {
            try
            {
                var psi = new ProcessStartInfo
                {
                    FileName = commandName,
                    Arguments = "--version",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using var process = new Process { StartInfo = psi };
                process.Start();
                process.WaitForExit(2000);
                return process.ExitCode == 0;
            }
            catch
            {
                return false;
            }
        }

        #endregion



        #region REST: Fetch Vessel Visit Notifications

        private sealed class VesselVisitNotificationDTO
        {
            public Guid Id { get; set; }
            public string VesselIMO { get; set; } = default!;
            public DateTime VisitDate { get; set; }
            public string Status { get; set; } = default!;
            public string Purpose { get; set; } = default!;

            public DateTime? ArrivalTime { get; set; }
            public DateTime? DesiredDepartureTime { get; set; }
            public int? EstimatedLoadingDurationMinutes { get; set; }
            public int? EstimatedUnloadingDurationMinutes { get; set; }
        }

        private async Task<IReadOnlyList<VesselVisitNotificationDTO>> GetVisitsForDateAsync(
            DateOnly targetDate,
            CancellationToken cancellationToken)
        {

            AttachUserBearerToken();

            var from = targetDate.ToDateTime(TimeOnly.MinValue);
            var to = targetDate.ToDateTime(TimeOnly.MaxValue);

            var url =
                $"/api/vesselvisitnotification/search" +
                $"?status=Approved" +
                $"&fromDate={Uri.EscapeDataString(from.ToString("O"))}" +
                $"&toDate={Uri.EscapeDataString(to.ToString("O"))}";

            var response = await _httpClient.GetAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new InvalidOperationException(
                    $"Error fetching vessel visits. Status={response.StatusCode}, Body={body}");
            }

            var list = await response.Content.ReadFromJsonAsync<List<VesselVisitNotificationDTO>>(cancellationToken: cancellationToken)
                       ?? new List<VesselVisitNotificationDTO>();

            return list;
        }

        #endregion



        #region Build Prolog Facts

        private (string Facts, Dictionary<string, VesselVisitNotificationDTO> IdMap)
            BuildPrologVesselFacts(
                IEnumerable<VesselVisitNotificationDTO> visits,
                DateOnly targetDate)
        {
            var sb = new StringBuilder();
            var idMap = new Dictionary<string, VesselVisitNotificationDTO>();

            foreach (var visit in visits)
            {
                var prologId = $"v_{visit.Id:N}";
                idMap[prologId] = visit;

                var arrival = GetArrivalTimeMinutes(visit, targetDate);
                var departure = GetDepartureTimeMinutes(visit, targetDate);
                var loading = GetLoadingTimeMinutes(visit);
                var unloading = GetUnloadingTimeMinutes(visit);

                sb.AppendLine(
                    $"vessel({prologId},{arrival},{departure},{loading},{unloading}).");
            }

            return (sb.ToString(), idMap);
        }


        private int GetArrivalTimeMinutes(VesselVisitNotificationDTO visit, DateOnly targetDate)
        {
            if (!visit.ArrivalTime.HasValue)
                throw new InvalidOperationException("ArrivalTime is required for scheduling.");

            var dt = visit.ArrivalTime.Value;
            var midnight = targetDate.ToDateTime(TimeOnly.MinValue);
            return (int)(dt - midnight).TotalMinutes;
        }

        private int GetDepartureTimeMinutes(VesselVisitNotificationDTO visit, DateOnly targetDate)
        {
            if (!visit.DesiredDepartureTime.HasValue)
                throw new InvalidOperationException("DesiredDepartureTime is required for scheduling.");

            var dt = visit.DesiredDepartureTime.Value;
            var midnight = targetDate.ToDateTime(TimeOnly.MinValue);
            return (int)(dt - midnight).TotalMinutes;
        }

        private int GetLoadingTimeMinutes(VesselVisitNotificationDTO visit)
            => visit.EstimatedLoadingDurationMinutes ?? 0;

        private int GetUnloadingTimeMinutes(VesselVisitNotificationDTO visit)
            => visit.EstimatedUnloadingDurationMinutes ?? 0;

        #endregion



        #region Run Prolog

        private async Task<(string SeqLine, string DelayLine)> RunPrologAsync(
    string vesselFacts,
    string heuristicAtom,
    CancellationToken cancellationToken)
        {
            var tempFile = Path.Combine(Path.GetTempPath(), $"schedule_{Guid.NewGuid():N}.pl");

            try
            {
                var script = new StringBuilder();

                // 1) Load your heuristics file
                script.AppendLine($":- consult('{EscapePathForProlog(_prologFilePath)}').");
                script.AppendLine();

                // 2) Assert all vessel facts as normal top-level facts
                script.AppendLine("% Vessel facts (generated by C#):");
                script.AppendLine(vesselFacts);   // ex: vessel(v_..., 360, 600, 60, 30).
                script.AppendLine();

                // 3) Define main/0 that just runs the chosen heuristic and halts
                script.AppendLine("main :-");
                script.AppendLine($"    run_heuristic({heuristicAtom}),");
                script.AppendLine("    halt.");
                script.AppendLine();

                await File.WriteAllTextAsync(tempFile, script.ToString(), cancellationToken);

                var psi = new ProcessStartInfo
                {
                    FileName = PrologCommandName,
                    // -q = quiet, -s script file, -g main, -t halt on failure
                    Arguments = $"-q -s \"{tempFile}\" -g main -t halt",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using var process = new Process { StartInfo = psi };
                process.Start();

                var stdoutTask = process.StandardOutput.ReadToEndAsync();
                var stderrTask = process.StandardError.ReadToEndAsync();

                // Timeout protection (10s)
                var waitTask = process.WaitForExitAsync(cancellationToken);
                var completed = await Task.WhenAny(
                    waitTask,
                    Task.Delay(TimeSpan.FromSeconds(10), cancellationToken));

                if (completed != waitTask)
                {
                    try { process.Kill(entireProcessTree: true); } catch { /* ignore */ }

                    var so = await stdoutTask;
                    var se = await stderrTask;
                    _logger.LogError(
                        "Prolog process timed out. Stdout: {Stdout} Stderr: {Stderr}",
                        so, se);

                    throw new InvalidOperationException("Prolog scheduling timed out.");
                }

                await waitTask; // ensure it really exited

                var stdout = await stdoutTask;
                var stderr = await stderrTask;

                if (process.ExitCode != 0)
                {
                    _logger.LogError(
                        "Prolog exited with code {ExitCode}. Stderr: {Stderr}",
                        process.ExitCode, stderr);

                    throw new InvalidOperationException(
                        $"Prolog scheduling failed. ExitCode={process.ExitCode}. Stderr={stderr}");
                }

                var lines = stdout
                    .Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(l => l.Trim())
                    .ToArray();

                if (lines.Length < 2)
                {
                    _logger.LogError("Unexpected Prolog output. Stdout: {Stdout}", stdout);
                    throw new InvalidOperationException(
                        $"Unexpected Prolog output. Expected 2 lines, got {lines.Length}. Output:\n{stdout}");
                }

                var seqLine = lines[0];
                var delayLine = lines[1];

                return (seqLine, delayLine);
            }
            finally
            {
                try { if (File.Exists(tempFile)) File.Delete(tempFile); }
                catch { /* ignore cleanup failures */ }
            }
        }

        private string EscapePathForProlog(string path)
            => path.Replace("\\", "\\\\");

        #endregion



        #region Parse Sequence Returned by Prolog

        private List<VesselScheduleEntry> ParseSeqTripletsLine(
            string seqLine,
            Dictionary<string, VesselVisitNotificationDTO> idMap,
            DateOnly targetDate)
        {
            var pattern = @"\(\s*([^,]+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)";
            var matches = Regex.Matches(seqLine, pattern);

            var entries = new List<VesselScheduleEntry>();
            var midnight = targetDate.ToDateTime(TimeOnly.MinValue);

            foreach (Match match in matches)
            {
                var idAtom = match.Groups[1].Value.Trim();
                var startStr = match.Groups[2].Value;
                var endStr = match.Groups[3].Value;

                if (!int.TryParse(startStr, out var startMinutes) ||
                    !int.TryParse(endStr, out var endMinutes))
                    throw new InvalidOperationException($"Invalid Prolog tuple: {match.Value}");

                if (!idMap.TryGetValue(idAtom, out var visit))
                    throw new InvalidOperationException($"Unknown vessel ID: {idAtom}");

                entries.Add(new VesselScheduleEntry
                {
                    VesselVisitId = visit.Id,
                    VesselIMO = visit.VesselIMO,
                    StartTime = midnight.AddMinutes(startMinutes),
                    EndTime = midnight.AddMinutes(endMinutes),
                    AssignedCraneId = null,
                    StaffMecNumbers = new List<string>(),
                    DelayMinutes = 0
                });
            }

            return entries;
        }

        #endregion



        #region Heuristic Validation

        private string NormalizeHeuristicName(string name) =>
            name.Trim().ToLower().Replace("-", "_").Replace(" ", "_");

        private void ValidateHeuristic(string heuristic)
        {
            var allowed = new HashSet<string>
            {
                "minimum_slack_time",
                "early_departure_time",
                "arrived_shortest_departure_time",
                "atc",
                "optimal"
            };

            if (!allowed.Contains(heuristic))
                throw new ArgumentException(
                    $"Unknown heuristic '{heuristic}'. Allowed: {string.Join(", ", allowed)}");
        }

        #endregion

        private void AttachUserBearerToken()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
                return;

            var authHeader = httpContext.Request.Headers["Authorization"].ToString();
            if (string.IsNullOrWhiteSpace(authHeader))
                return;

            // Expect "Bearer <token>"
            const string bearerPrefix = "Bearer ";
            if (!authHeader.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase))
                return;

            var token = authHeader.Substring(bearerPrefix.Length).Trim();
            if (string.IsNullOrEmpty(token))
                return;

            // Set on outgoing HttpClient
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token);
        }

    }


}
