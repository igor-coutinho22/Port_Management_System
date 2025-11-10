/*using System.Diagnostics;
using WebApp.Models.Domain.Scheduling;
using WebApp.Models.Domain.Scheduling.Interfaces;
using WebApp.Models.Domain.Vessels;

namespace Application.Services
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
                "Domain", "Scheduling", "scheduling_heuristic.pl");
        }

        public SchedulingResult ComputeSchedule(IEnumerable<Vessel> vessels)
        {
            var tempFactsFile = Path.GetTempFileName();
            File.WriteAllText(tempFactsFile, BuildVesselFacts(vessels));

            var psi = new ProcessStartInfo
            {
                FileName = "swipl",
                Arguments = $"-q -f \"{_prologFilePath}\" -g \"obtain_seq_heuristic(_, _).\" -t halt.",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            var process = new Process { StartInfo = psi };
            process.Start();

            string output = process.StandardOutput.ReadToEnd();
            string errors = process.StandardError.ReadToEnd();
            process.WaitForExit();

            if (!string.IsNullOrWhiteSpace(errors))
                Console.WriteLine($"[Prolog error] {errors}");

            File.Delete(tempFactsFile);

            return ParsePrologOutput(output);
        }

        private string BuildVesselFacts(IEnumerable<Vessel> vessels)
        {
            return string.Join(Environment.NewLine,
                vessels.Select(v =>
                    $"vessel({v.IMO.ToLower()}, {v.ArrivalTime}, {v.DepartureTime}, {v.UnloadTime}, {v.LoadTime})."));
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
*/