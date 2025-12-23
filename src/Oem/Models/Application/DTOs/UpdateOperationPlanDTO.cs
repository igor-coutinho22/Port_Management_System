namespace Oem.Models.DTOs.OperationPlans
{
    public class UpdateOperationPlanDTO
    {
        public UpdateOperationPlanItemDTO Item { get; set; } = new();
        public string Author { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
    }

    public class UpdateOperationPlanItemDTO
    {
        public Guid ItemId { get; set; }
        public DateTime ServiceStartTime { get; set; }
        public DateTime ServiceEndTime { get; set; }
        public int NumberOfCranes { get; set; }
        public int NumberOfStaff { get; set; }
        public int MinUnloadMinutes { get; set; }
        public int MinLoadMinutes { get; set; }
    }
}
