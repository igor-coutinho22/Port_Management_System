namespace WebApp.Models.Application.DTOs
{
    /// <summary>
    /// Data Transfer Object representing the result of a scheduling computation.
    /// Used to expose heuristic scheduling results via API.
    /// </summary>
    public class SchedulingResultDTO
    {
        public string? Sequence { get; set; }
        public double TotalDelay { get; set; }
        public double RuntimeSeconds { get; set; }
    }
}
