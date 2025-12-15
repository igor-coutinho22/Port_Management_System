namespace Oem.Models.Application.DTOs
{
    
    public class SchedulingResultDTO
    {
        public string HeuristicName { get; set; } = default!;
        public double TotalDelayMinutes { get; set; }
        public double RuntimeSeconds { get; set; }

        public List<VesselScheduleEntryDTO> Entries { get; set; } = new();

        public List<string> Warnings { get; set; } = new();
    }
}