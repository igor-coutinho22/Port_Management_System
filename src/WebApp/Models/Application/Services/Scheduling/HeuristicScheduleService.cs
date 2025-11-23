using System.Diagnostics;
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
        private bool _prologChecked;

        public HeuristicScheduleService(
            IHttpClientFactory httpClientFactory,
            ILogger<HeuristicScheduleService> logger,
            IConfiguration configuration)
        {
            _logger = logger;
            _httpClient = httpClientFactory.CreateClient("DomainBackend");

            _prologFilePath = Path.Combine(
                AppContext.BaseDirectory,
                "Domain", "Scheduling", "scheduling_heuristic.pl");
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

            // 1) Get visits for that day via REST
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

            // 3) Run the chosen heuristic in Prolog
            var (seqLine, delayLine) =
                await RunPrologAsync(vesselFacts, heuristicAtom, cancellationToken);

            // 4) Parse sequence
            var entries = ParseSeqTripletsLine(seqLine, idMap, targetDate);

            // 5) Parse delay
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

        #region Prolog availability (Option A)

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

        #region REST calls to other modules

        private sealed class VesselVisitNotificationDTO
        {
            public Guid Id { get; set; }
            public string VesselIMO { get; set; } = default!;
            public DateTime VisitDate { get; set; }
            public string Status { get; set; } = default!;
            // TODO: extend with ArrivalTime, DesiredDepartureTime, etc. if needed
        }

        private async Task<IReadOnlyList<VesselVisitNotificationDTO>> GetVisitsForDateAsync(
            DateOnly targetDate,
            CancellationToken cancellationToken)
        {
            var from = targetDate.ToDateTime(TimeOnly.MinValue);
            var to = targetDate.ToDateTime(TimeOnly.MaxValue);

            // Assuming "Approved" is a valid status string in your search endpoint
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
                    $"Error fetching vessel visits. Status: {response.StatusCode}, Body: {body}");
            }

            var list = await response.Content.ReadFromJsonAsync<List<VesselVisitNotificationDTO>>(
                cancellationToken: cancellationToken)
                       ?? new List<VesselVisitNotificationDTO>();

            return list;
        }

        #endregion

        #region Prolog facts

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

                var arrivalMinutes = GetArrivalTimeMinutes(visit, targetDate);
                var departureMinutes = GetDepartureTimeMinutes(visit, targetDate);
                var loadingMinutes = GetLoadingTimeMinutes(visit);
                var unloadingMinutes = GetUnloadingTimeMinutes(visit);

                sb.AppendLine(
                    $"vessel({prologId},{arrivalMinutes},{departureMinutes},{loadingMinutes},{unloadingMinutes}).");
            }

            return (sb.ToString(), idMap);
        }

        // -------- TODOs: domain-specific time logic (you fill these) --------

        private int GetArrivalTimeMinutes(VesselVisitNotificationDTO visit, DateOnly targetDate)
        {
            // Example if VisitDate already encodes arrival with time-of-day:
            // var dt = visit.VisitDate;
            // var midnight = targetDate.ToDateTime(TimeOnly.MinValue);
            // return (int)(dt - midnight).TotalMinutes;

            throw new NotImplementedException("GetArrivalTimeMinutes must be implemented.");
        }

        private int GetDepartureTimeMinutes(VesselVisitNotificationDTO visit, DateOnly targetDate)
        {
            // Requires a desired departure DateTime somewhere in your DTO/entity.
            throw new NotImplementedException("GetDepartureTimeMinutes must be implemented.");
        }

        private int GetLoadingTimeMinutes(VesselVisitNotificationDTO visit)
        {
            // Derive from manifests / cargo data (or approximate).
            throw new NotImplementedException("GetLoadingTimeMinutes must be implemented.");
        }

        private int GetUnloadingTimeMinutes(VesselVisitNotificationDTO visit)
        {
            // Same as loading.
            throw new NotImplementedException("GetUnloadingTimeMinutes must be implemented.");
        }

        #endregion

        #region Running Prolog

        private async Task<(string SeqLine, string DelayLine)> RunPrologAsync(
            string vesselFacts,
            string heuristicAtom,
            CancellationToken cancellationToken)
        {
            var tempFile = Path.Combine(
                Path.GetTempPath(),
                $"schedule_{Guid.NewGuid():N}.pl");

            try
            {
                var script = new StringBuilder();

                script.AppendLine($":- consult('{EscapePathForProlog(_prologFilePath)}').");
                script.AppendLine(":- initialization(main).");
                script.AppendLine();
                script.AppendLine(vesselFacts);
                script.AppendLine($@"
main :-
    run_heuristic({heuristicAtom}),
    halt.
");

                await File.WriteAllTextAsync(tempFile, script.ToString(), cancellationToken);

                var psi = new ProcessStartInfo
                {
                    FileName = PrologCommandName,
                    Arguments = $"-q -f \"{tempFile}\"",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using var process = new Process { StartInfo = psi };
                process.Start();

                var stdoutTask = process.StandardOutput.ReadToEndAsync();
                var stderrTask = process.StandardError.ReadToEndAsync();

                await Task.WhenAll(stdoutTask, stderrTask);
                await process.WaitForExitAsync(cancellationToken);

                var stdout = stdoutTask.Result;
                var stderr = stderrTask.Result;

                if (process.ExitCode != 0)
                {
                    _logger.LogError("Prolog error. Exit {ExitCode}. Stderr: {Stderr}",
                        process.ExitCode, stderr);
                    throw new InvalidOperationException("Prolog scheduling failed. See logs for details.");
                }

                var lines = stdout
                    .Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(l => l.Trim())
                    .ToArray();

                if (lines.Length < 2)
                {
                    throw new InvalidOperationException(
                        $"Unexpected Prolog output. Expected 2 lines, got {lines.Length}. Output: {stdout}");
                }

                var seqLine = lines[0];
                var delayLine = lines[1];

                return (seqLine, delayLine);
            }
            finally
            {
                try
                {
                    if (File.Exists(tempFile))
                        File.Delete(tempFile);
                }
                catch
                {
                    // ignore cleanup failures
                }
            }
        }

        private static string EscapePathForProlog(string path)
        {
            return path.Replace("\\", "\\\\");
        }

        #endregion

        #region Parsing sequence

        private List<VesselScheduleEntry> ParseSeqTripletsLine(
            string seqLine,
            Dictionary<string, VesselVisitNotificationDTO> idMap,
            DateOnly targetDate)
        {
            var pattern = @"\(\s*([^,]+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)";
            var matches = Regex.Matches(seqLine, pattern);

            var entries = new List<VesselScheduleEntry>();
            var dayStart = targetDate.ToDateTime(TimeOnly.MinValue);

            foreach (Match match in matches)
            {
                var idAtom = match.Groups[1].Value.Trim();
                var startStr = match.Groups[2].Value;
                var endStr = match.Groups[3].Value;

                if (!int.TryParse(startStr, out var startMinutes) ||
                    !int.TryParse(endStr, out var endMinutes))
                {
                    throw new InvalidOperationException(
                        $"Could not parse start/end minutes from Prolog term: '{match.Value}'");
                }

                if (!idMap.TryGetValue(idAtom, out var visit))
                    throw new InvalidOperationException($"Unknown vessel ID from Prolog: '{idAtom}'");

                var startTime = dayStart.AddMinutes(startMinutes);
                var endTime = dayStart.AddMinutes(endMinutes);

                var entry = new VesselScheduleEntry
                {
                    VesselVisitId = visit.Id,
                    VesselIMO = visit.VesselIMO,
                    StartTime = startTime,
                    EndTime = endTime,
                    AssignedCraneId = null,
                    StaffMecNumbers = new List<string>(),
                    DelayMinutes = 0 // optional: compute per-vessel delay here
                };

                entries.Add(entry);
            }

            return entries;
        }

        #endregion

        #region Heuristic validation

        private string NormalizeHeuristicName(string heuristicName)
        {
            // make it Prolog-atom friendly: lowercase, replace spaces/dashes with underscore
            var norm = heuristicName
                .Trim()
                .ToLowerInvariant()
                .Replace("-", "_")
                .Replace(" ", "_");
            return norm;
        }

        private void ValidateHeuristic(string heuristicAtom)
        {
            // restrict to the ones you actually implemented in Prolog
            var allowed = new HashSet<string>
            {
                "minimum_slack_time",
                "early_departure_time",
                "arrived_shortest_departure_time",
                "atc"
            };

            if (!allowed.Contains(heuristicAtom))
            {
                throw new ArgumentException(
                    $"Unknown heuristic '{heuristicAtom}'. Allowed: {string.Join(", ", allowed)}");
            }
        }

        #endregion
    }
}
