using Oem.Models.Application.DTOs;

namespace Oem.Models.DTOs.OperationPlans
{
    public class OperationPlanDTO
    {
        public Guid Id { get; set; }
        public DateOnly ScheduleDate { get; set; }
        public string HeuristicUsed { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public double TotalDelayMinutes { get; set; }
        public double RuntimeSeconds { get; set; }
        public string Author { get; set; } = string.Empty;
        public List<OperationPlanItemDTO> Items { get; set; } = new();
    }

    public class CreateOperationPlanDTO
    {
        public Guid Id { get; set; }
        public DateOnly ScheduleDate { get; set; }
        public string HeuristicUsed { get; set; } = string.Empty;
        public double TotalDelayMinutes { get; set; }
        public double RuntimeSeconds { get; set; }
        public string Author { get; set; } = string.Empty;
        
        // This accepts the generic result structure we already have
        public List<VesselScheduleEntryDTO> Entries { get; set; } = new();
    }
}
