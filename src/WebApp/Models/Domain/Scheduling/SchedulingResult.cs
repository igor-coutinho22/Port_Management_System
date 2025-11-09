namespace WebApp.Models.Domain.Scheduling
{
    /// <summary>
    /// Represents the result of any scheduling algorithm within the domain layer.
    /// </summary>
    public class SchedulingResult
    {
        public string? Sequence { get; set; }
        public double TotalDelay { get; set; }
        public double RuntimeSeconds { get; set; }
    }
}
