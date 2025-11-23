namespace WebApp.Models.Domain.Scheduling
{
    public class SchedulingResult
    {
        public string HeuristicName { get; set; } = default!;
        public double TotalDelayMinutes { get; set; }
        public double RuntimeSeconds { get; set; }
        public List<VesselScheduleEntry> Entries { get; set; } = new();

        // not enough staff for example
        public List<string> Warnings { get; set; } = new();
    }
}
