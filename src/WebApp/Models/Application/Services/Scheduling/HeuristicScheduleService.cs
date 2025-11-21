using System.Diagnostics;
using WebApp.Models.Domain.Scheduling;
using WebApp.Models.Domain.Scheduling.Interfaces;
using WebApp.Models.Domain.Vessels;

namespace WebApp.Models.Application.Services.Scheduling
{
    /// <summary>
    /// Provides an efficient heuristic scheduling algorithm (User Story 3.4.4).
    /// Coordinates the Prolog-based computation and produces a domain-level result.
    /// </summary>
    public class HeuristicScheduleService : IHeuristicScheduleService
    {
        private readonly string _prologFilePath;

        public HeuristicScheduleService()
        {
            _prologFilePath = Path.Combine(AppContext.BaseDirectory,
                "Models", "Domain", "Scheduling", "heuristic_schedule.pl");
        }

        public SchedulingResult ComputeSchedule(IEnumerable<Vessel>? vessels)
        {
            // For now, use demo data embedded in the Prolog file
            // Future enhancement: generate vessel facts dynamically from the vessels parameter

            var psi = new ProcessStartInfo
            {
                FileName = "swipl",
                Arguments = $"-q -f \"{_prologFilePath}\" -g \"obtain_seq_heuristic(_, _).\" -t halt.",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            try
            {
                var process = new Process { StartInfo = psi };
                process.Start();

                string output = process.StandardOutput.ReadToEnd();
                string errors = process.StandardError.ReadToEnd();
                process.WaitForExit();

                if (!string.IsNullOrWhiteSpace(errors))
                {
                    Console.WriteLine($"[Prolog warning/error] {errors}");
                }

                return ParsePrologOutput(output);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Error] Failed to execute Prolog: {ex.Message}");
                return new SchedulingResult
                {
                    Sequence = "Error: SWI-Prolog not available",
                    TotalDelay = 0,
                    RuntimeSeconds = 0
                };
            }
        }

        private SchedulingResult ParsePrologOutput(string output)
        {
            var result = new SchedulingResult();

            var seqLine = output.Split('\n').FirstOrDefault(l => l.Contains("Sequence:"));
            var delayLine = output.Split('\n').FirstOrDefault(l => l.Contains("Total Delay:"));
            var timeLine = output.Split('\n').FirstOrDefault(l => l.Contains("Computation Time:"));

            result.Sequence = seqLine?.Split(':').LastOrDefault()?.Trim();
            result.TotalDelay = ExtractNumericValue(delayLine);
            result.RuntimeSeconds = ExtractNumericValue(timeLine);

            return result;
        }

        private double ExtractNumericValue(string? line)
        {
            if (string.IsNullOrWhiteSpace(line)) return 0;
            var parts = new string(line.Where(c => char.IsDigit(c) || c == '.').ToArray());
            return double.TryParse(parts, out var value) ? value : 0;
        }
    }
}