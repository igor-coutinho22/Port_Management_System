using System.Diagnostics;
using System.Net.Http.Headers;
using System.Text;
using System.Text.RegularExpressions;
using Oem.Models.Application.DTOs;
using Oem.Models.Domain.Scheduling;
using Oem.Models.Domain.Scheduling.Services;

namespace Oem.Models.Application.Services.Scheduling
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

        public async Task<MultiCraneComparisonResultDTO> GenerateDailyScheduleWithMultiCraneAsync(
            DateOnly targetDate,
            string heuristicName,
            CancellationToken cancellationToken = default)
        {
            // 1) Run existing single-crane logic
            var single = await GenerateDailyScheduleAsync(targetDate, heuristicName, cancellationToken);

            // No delay -> nothing more to do
            if (single.TotalDelayMinutes <= 0.0001) // tiny epsilon
            {
                return new MultiCraneComparisonResultDTO
                {
                    SingleCrane = MapToDto(single),
                    MultiCrane = null,
                    CraneHoursSingle = ComputeCraneHours(single),
                    CraneHoursMulti = null
                };
            }

            // 2) We have delay -> run multi-crane improvement using the SAME visits
            var visits = await GetVisitsForDateAsync(targetDate, cancellationToken);

            var (vesselFacts, idMap) = BuildPrologVesselFacts(visits, targetDate);

            // build sequence(V) facts in the exact order returned by single-crane schedule
            var sequenceFacts = BuildSequenceFacts(single.Entries, idMap);

            var (seqLine, delayLine, craneMinutesLine) =
                await RunPrologMultiCraneAsync(vesselFacts, sequenceFacts, cancellationToken);

            var multiEntries = ParseSeqQuadrupletsLine(seqLine, idMap, targetDate);

            if (!double.TryParse(delayLine, out var multiDelay))
                throw new InvalidOperationException($"Could not parse multi-crane delay: '{delayLine}'");

            if (!double.TryParse(craneMinutesLine, out var totalCraneMinutes))
                throw new InvalidOperationException($"Could not parse crane-minutes: '{craneMinutesLine}'");

            var multiResult = new SchedulingResult
            {
                HeuristicName = NormalizeHeuristicName(heuristicName) + "_multi",
                TotalDelayMinutes = multiDelay,
                RuntimeSeconds = 0, // or measure separately
                Entries = multiEntries,
                Warnings = new List<string>()
            };

            return new MultiCraneComparisonResultDTO
            {
                SingleCrane = MapToDto(single),
                MultiCrane = MapToDto(multiResult),
                CraneHoursSingle = ComputeCraneHours(single),
                CraneHoursMulti = totalCraneMinutes / 60.0
            };
        }


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
            var body = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                // Backend currently throws InvalidOperationException("No vessel visit notifications found with the specified criteria.")
                // and returns HTTP 500. We interpret that as "no results", not as a fatal error.
                var isNoVisits =
                    (int)response.StatusCode == 500 &&
                    body.Contains("No vessel visit notifications found with the specified criteria",
                                  StringComparison.OrdinalIgnoreCase);

                if (isNoVisits)
                {
                    _logger.LogInformation("No vessel visits found for {Date}. Returning empty list.", targetDate);
                    return Array.Empty<VesselVisitNotificationDTO>();
                }

                // Any other 4xx/5xx is still a real error.
                throw new InvalidOperationException(
                    $"Error fetching vessel visits. Status={response.StatusCode}, Body={body}");
            }

            // Normal success: parse JSON
            var list = System.Text.Json.JsonSerializer.Deserialize<List<VesselVisitNotificationDTO>>(
                           body,
                           new System.Text.Json.JsonSerializerOptions
                           {
                               PropertyNameCaseInsensitive = true
                           })
                       ?? new List<VesselVisitNotificationDTO>();

            return list;
        }


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
            if (visit.ArrivalTime == default)
                throw new InvalidOperationException("ArrivalTime is required for scheduling.");

            var dt = visit.ArrivalTime;
            var midnight = targetDate.ToDateTime(TimeOnly.MinValue);
            return (int)(dt - midnight).TotalMinutes;
        }

        private int GetDepartureTimeMinutes(VesselVisitNotificationDTO visit, DateOnly targetDate)
        {
            if (visit.DesiredDepartureTime == default)
                throw new InvalidOperationException("DesiredDepartureTime is required for scheduling.");

            var dt = visit.DesiredDepartureTime;
            var midnight = targetDate.ToDateTime(TimeOnly.MinValue);
            return (int)(dt - midnight).TotalMinutes;
        }

        private int GetLoadingTimeMinutes(VesselVisitNotificationDTO visit)
            => visit.EstimatedLoadingDurationMinutes;

        private int GetUnloadingTimeMinutes(VesselVisitNotificationDTO visit)
            => visit.EstimatedUnloadingDurationMinutes;

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

        private async Task<(string SeqLine, string DelayLine, string CraneMinutesLine)> RunPrologMultiCraneAsync(
            string vesselFacts,
            string sequenceFacts,
            CancellationToken cancellationToken)
        {
            var tempFile = Path.Combine(Path.GetTempPath(), $"schedule_multi_{Guid.NewGuid():N}.pl");

            try
            {
                var script = new StringBuilder();

                // 1) Load heuristics file (it now also contains run_multi_from_sequence/0)
                script.AppendLine($":- consult('{EscapePathForProlog(_prologFilePath)}').");
                script.AppendLine();

                // 2) Assert vessel facts
                script.AppendLine("% Vessel facts (generated by C#):");
                script.AppendLine(vesselFacts);
                script.AppendLine();

                // 3) Assert sequence(V) facts from the single-crane result
                script.AppendLine("% Vessel order from single-crane schedule:");
                script.AppendLine(sequenceFacts);
                script.AppendLine();

                // 4) Define main/0 that runs the multi-crane scheduler
                script.AppendLine("main :-");
                script.AppendLine("    run_multi_from_sequence,");
                script.AppendLine("    halt.");
                script.AppendLine();

                await File.WriteAllTextAsync(tempFile, script.ToString(), cancellationToken);

                var psi = new ProcessStartInfo
                {
                    FileName = PrologCommandName,
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

                var waitTask = process.WaitForExitAsync(cancellationToken);
                var completed = await Task.WhenAny(
                    waitTask,
                    Task.Delay(TimeSpan.FromSeconds(10), cancellationToken));

                if (completed != waitTask)
                {
                    try { process.Kill(entireProcessTree: true); } catch { }

                    var so = await stdoutTask;
                    var se = await stderrTask;
                    _logger.LogError("Prolog multi-crane timed out. Stdout: {Stdout} Stderr: {Stderr}", so, se);
                    throw new InvalidOperationException("Prolog multi-crane scheduling timed out.");
                }

                await waitTask;
                var stdout = await stdoutTask;
                var stderr = await stderrTask;

                if (process.ExitCode != 0)
                {
                    _logger.LogError("Prolog multi-crane exited with {ExitCode}. Stderr: {Stderr}",
                        process.ExitCode, stderr);
                    throw new InvalidOperationException(
                        $"Prolog multi-crane scheduling failed. ExitCode={process.ExitCode}. Stderr={stderr}");
                }

                var lines = stdout
                    .Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(l => l.Trim())
                    .ToArray();

                if (lines.Length < 3)
                {
                    _logger.LogError("Unexpected multi-crane Prolog output. Stdout: {Stdout}", stdout);
                    throw new InvalidOperationException(
                        $"Unexpected Prolog output (multi-crane). Expected 3 lines, got {lines.Length}. Output:\n{stdout}");
                }

                return (lines[0], lines[1], lines[2]);
            }
            finally
            {
                try { if (File.Exists(tempFile)) File.Delete(tempFile); } catch { }
            }
        }


        private string EscapePathForProlog(string path)
            => path.Replace("\\", "\\\\");

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
                    VesselIMO = visit.VesselIMO!,
                    StartTime = midnight.AddMinutes(startMinutes),
                    EndTime = midnight.AddMinutes(endMinutes),
                    AssignedCraneId = null,
                    StaffMecNumbers = new List<string>(),
                    DelayMinutes = 0
                });
            }

            return entries;
        }

        private List<VesselScheduleEntry> ParseSeqQuadrupletsLine(
            string seqLine,
            Dictionary<string, VesselVisitNotificationDTO> idMap,
            DateOnly targetDate)
        {
            // Matches (v_xxx, 123, 456, 2)
            var pattern = @"\(\s*([^,]+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)";
            var matches = Regex.Matches(seqLine, pattern);

            var entries = new List<VesselScheduleEntry>();
            var midnight = targetDate.ToDateTime(TimeOnly.MinValue);

            foreach (Match match in matches)
            {
                var idAtom = match.Groups[1].Value.Trim();
                var startStr = match.Groups[2].Value;
                var endStr = match.Groups[3].Value;
                var cranesStr = match.Groups[4].Value;

                if (!int.TryParse(startStr, out var startMinutes) ||
                    !int.TryParse(endStr, out var endMinutes) ||
                    !int.TryParse(cranesStr, out var cranes))
                {
                    throw new InvalidOperationException($"Invalid Prolog quadruple: {match.Value}");
                }

                if (!idMap.TryGetValue(idAtom, out var visit))
                    throw new InvalidOperationException($"Unknown vessel ID: {idAtom}");

                entries.Add(new VesselScheduleEntry
                {
                    VesselVisitId = visit.Id,
                    VesselIMO = visit.VesselIMO!,
                    StartTime = midnight.AddMinutes(startMinutes),
                    EndTime = midnight.AddMinutes(endMinutes),
                    NumberOfCranes = cranes,
                    AssignedCraneId = null,
                    DelayMinutes = 0   // if you want per-vessel delay, you can compute afterwards
                });
            }

            return entries;
        }


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

        private SchedulingResultDTO MapToDto(SchedulingResult result) => new()
        {
            HeuristicName = result.HeuristicName,
            TotalDelayMinutes = result.TotalDelayMinutes,
            RuntimeSeconds = result.RuntimeSeconds,
            Entries = result.Entries.Select(e => new VesselScheduleEntryDTO
            {
                VesselVisitId = e.VesselVisitId,
                VesselIMO = e.VesselIMO,
                StartTime = e.StartTime,
                EndTime = e.EndTime,
                DelayMinutes = e.DelayMinutes,
                NumberOfCranes = e.NumberOfCranes
            }).ToList(),
            Warnings = result.Warnings.ToList()
        };

        private double ComputeCraneHours(SchedulingResult result)
        {
            // For single-crane case: sum of 1 * duration per job
            var totalMinutes = result.Entries
                .Sum(e => (e.EndTime - e.StartTime).TotalMinutes * Math.Max(e.NumberOfCranes, 1));
            return totalMinutes / 60.0;
        }

        private string BuildSequenceFacts(
            IEnumerable<VesselScheduleEntry> entries,
            Dictionary<string, VesselVisitNotificationDTO> idMap)
        {
            var sb = new StringBuilder();

            // IMPORTANT: we reconstruct the prologId the same way as in BuildPrologVesselFacts
            foreach (var entry in entries.OrderBy(e => e.StartTime))
            {
                var prologId = $"v_{entry.VesselVisitId:N}";
                sb.AppendLine($"sequence({prologId}).");
            }

            return sb.ToString();
        }


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
