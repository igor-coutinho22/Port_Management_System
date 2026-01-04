using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
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
        private readonly TimeSpan _prologTimeout = TimeSpan.FromSeconds(30); // tune as needed


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

            var stopwatch = Stopwatch.StartNew();

            // Fetch approved visits for the selected day via REST
            var visits = await GetVisitsForDateAsync(targetDate, cancellationToken);

            if (!visits.Any())
            {
                return new SchedulingResult
                {
                    HeuristicName = heuristicName,
                    TotalDelayMinutes = 0,
                    RuntimeSeconds = 0,
                    Entries = new List<VesselScheduleEntry>(),
                    Warnings = new List<string> { "No vessel visits for selected date." }
                };
            }

            // AUTO selection (US 4.3.2): if user passed "auto" pick sensible algorithm
            var selectedAlgorithm = SelectAlgorithmAutomatically(heuristicName, visits.Count);

            var algorithmAtom = NormalizeHeuristicName(selectedAlgorithm);
            ValidateHeuristic(algorithmAtom);

            // Build Prolog facts & ID map
            var (vesselFacts, idMap) = BuildPrologVesselFacts(visits, targetDate);

            _logger.LogInformation("Selected algorithm for scheduling: {Alg} (vessels={Count})", algorithmAtom, idMap.Count);

            // Run specific heuristic / genetic
            var (seqLine, delayLine) =
                await RunPrologAsync(vesselFacts, algorithmAtom, cancellationToken);

            // Parse the sequence returned by Prolog
            var entries = ParseSeqTripletsLine(seqLine, idMap, targetDate);

            // Parse total delay
            if (!double.TryParse(delayLine, out var totalDelay))
                throw new InvalidOperationException($"Could not parse delay value from Prolog: '{delayLine}'");

            stopwatch.Stop();

            return new SchedulingResult
            {
                HeuristicName = algorithmAtom,
                TotalDelayMinutes = totalDelay,
                RuntimeSeconds = stopwatch.Elapsed.TotalSeconds,
                Entries = entries,
                Warnings = new List<string>()
            };
        }

        private string SelectAlgorithmAutomatically(string requestedAlgorithm, int vesselCount)
        {
            // If user did NOT ask for auto, respect their choice
            if (!requestedAlgorithm.Equals("auto", StringComparison.OrdinalIgnoreCase))
                return requestedAlgorithm;

            // Simple decision rules (can be tuned later)
            if (vesselCount <= 6)
                return "optimal";

            if (vesselCount <= 12)
                return "genetic";

            return "atc";
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

        private async Task<IReadOnlyList<DockDTO>> GetDocksAsync(CancellationToken cancellationToken)
        {
            AttachUserBearerToken();

            var response = await _httpClient.GetAsync("/api/dock", cancellationToken);
            var body = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException(
                    $"Error fetching docks. Status={response.StatusCode}, Body={body}");

            return System.Text.Json.JsonSerializer.Deserialize<List<DockDTO>>(body,
                new System.Text.Json.JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }) ?? new List<DockDTO>();
        }


        private Dictionary<string, Guid> BuildDockIdMap(IEnumerable<DockDTO> docks)
        {
            var map = new Dictionary<string, Guid>();

            foreach (var d in docks)
            {
                if (d.Id is null)
                    throw new InvalidOperationException("Dock without Id encountered");

                map[$"d_{d.Id.Value:N}"] = d.Id.Value;
            }

            return map;
        }


        private (string Facts, Dictionary<string, VesselVisitNotificationDTO> IdMap) BuildPrologVesselFacts(
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
            string algorithmAtom,
            CancellationToken cancellationToken)
        {
            var tempFile = Path.Combine(Path.GetTempPath(), $"schedule_{Guid.NewGuid():N}.pl");

            try
            {
                var script = new StringBuilder();

                // 1) Load your heuristics file (and GA file if consulted inside)
                script.AppendLine($":- consult('{EscapePathForProlog(_prologFilePath)}').");
                script.AppendLine();

                // 2) Assert all vessel facts as normal top-level facts
                script.AppendLine("% Vessel facts (generated by C#):");
                script.AppendLine(vesselFacts);   // ex: vessel(v_..., 360, 600, 60, 30).
                script.AppendLine();

                // 3) Define main/0 that runs the chosen algorithm and halts
                script.AppendLine("main :-");

                if (algorithmAtom == "genetic")
                    script.AppendLine("    run_genetic,");
                else
                    script.AppendLine($"    run_heuristic({algorithmAtom}),");

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
                    Task.Delay(_prologTimeout, cancellationToken));

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
                    Task.Delay(_prologTimeout, cancellationToken));

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
                    NumberOfCranes = 1,
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
                "optimal",
                "genetic"
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

        private async Task<(string AssignLine, string DelayLine)> RunPrologRebalanceAsync(string vesselFacts, string dockFacts, CancellationToken cancellationToken)
        {
            var tempFile = Path.Combine(Path.GetTempPath(), $"rebalance_{Guid.NewGuid():N}.pl");

            try
            {
                var script = new StringBuilder();

                script.AppendLine($":- consult('{EscapePathForProlog(_prologFilePath)}').");
                script.AppendLine();
                script.AppendLine(vesselFacts);
                script.AppendLine(dockFacts);
                script.AppendLine();
                script.AppendLine("main :- main_rebalance, halt.");

                await File.WriteAllTextAsync(tempFile, script.ToString(), cancellationToken);

                var psi = new ProcessStartInfo
                {
                    FileName = "swipl",
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

                await process.WaitForExitAsync(cancellationToken);

                var stdout = await stdoutTask;
                var stderr = await stderrTask;

                if (process.ExitCode != 0)
                    throw new InvalidOperationException($"Prolog failed: {stderr}");

                var lines = stdout
                    .Split('\n', StringSplitOptions.RemoveEmptyEntries)
                    .Select(l => l.Trim())
                    .ToArray();

                return (lines[0], lines[1]);
            }
            finally
            {
                try { File.Delete(tempFile); } catch { }
            }
        }

        private List<(string PrologVisitId, string DockId)> ParseAssignments(string line)
        {
            // matches assign(v_xxxxx, d123)
            var pattern = @"assign\(([^,]+),\s*([^)]+)\)";
            var matches = Regex.Matches(line, pattern);

            var list = new List<(string, string)>();

            foreach (Match m in matches)
            {
                var v = m.Groups[1].Value.Trim();
                var d = m.Groups[2].Value.Trim();
                list.Add((v, d));
            }

            return list;
        }

        private string BuildDockFacts(IEnumerable<DockDTO> docks)
        {
            var sb = new StringBuilder();

            foreach (var d in docks)
            {
                if (d.Id is null)
                    throw new InvalidOperationException("Dock without Id encountered");

                var did = $"d_{d.Id.Value:N}";

                // base dock fact
                sb.AppendLine($"dock({did}, {d.LengthMeters}, {d.DepthMeters}, {d.MaxDraftMeters}).");

                // allowed vessel type facts
                foreach (var vt in d.AllowedVesselTypes)
                {
                    var normalized = vt.Replace(" ", "_").ToLowerInvariant();
                    sb.AppendLine($"allowed_type({did}, {normalized}).");
                }
            }

            return sb.ToString();
        }


        public async Task ApplyDockRebalanceAsync(
    DateOnly targetDate,
    CancellationToken cancellationToken = default)
        {
            EnsurePrologAvailable();

            // 1) Load data
            var visits = await GetVisitsForDateAsync(targetDate, cancellationToken);
            if (!visits.Any())
                throw new InvalidOperationException("No approved visits to rebalance.");

            var docks = await GetDocksAsync(cancellationToken);
            if (!docks.Any())
                throw new InvalidOperationException("No docks available.");

            // 2) Build facts + maps
            var (vesselFacts, vesselIdMap) = BuildPrologVesselFacts(visits, targetDate);
            var dockFacts = BuildDockFacts(docks);
            var dockIdMap = BuildDockIdMap(docks);

            // 3) Run Prolog
            var (assignLine, delayLine) =
                await RunPrologRebalanceAsync(vesselFacts, dockFacts, cancellationToken);

            // 4) Parse assign(v_x, d_y) list
            var assignments = ParseAssignments(assignLine);

            if (!double.TryParse(delayLine, out var totalDelay))
                throw new InvalidOperationException($"Could not parse delay value '{delayLine}'");

            // 5) Convert to DTO for backend
            var dto = assignments.Select(a => new VesselScheduleAssignmentDTO
            {
                VesselVisitId = vesselIdMap[a.PrologVisitId].Id,
                DockId = dockIdMap[a.DockId]
            }).ToList();

            // 6) Call backend apply endpoint
            AttachUserBearerToken();
            var json = System.Text.Json.JsonSerializer.Serialize(dto);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PutAsync(
                "/api/vesselvisitnotification/schedule",
                content,
                cancellationToken);

            var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                throw new InvalidOperationException(
                    $"Backend rejected rebalance. Status={response.StatusCode}, Body={responseBody}");
            }

            _logger.LogInformation("Dock rebalance applied successfully. TotalDelay = {Delay}", totalDelay);
        }



    }
}
