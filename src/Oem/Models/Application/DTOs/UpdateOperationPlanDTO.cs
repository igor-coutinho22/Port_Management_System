namespace Oem.Models.DTOs.OperationPlans
{
    public class UpdateOperationPlanDTO
    {
        public List<UpdateOperationPlanItemDTO> Items { get; set; } = new();
        public string Author { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
    }

    public class UpdateOperationPlanItemDTO
    {
        public Guid ItemId { get; set; }
        public DateTime ServiceStartTime { get; set; }
        public DateTime ServiceEndTime { get; set; }
        public DateTime UnloadingStartTime { get; set; }
        public DateTime UnloadingEndTime { get; set; }
        public DateTime LoadingStartTime { get; set; }
        public DateTime LoadingEndTime { get; set; }
        public int NumberOfCranes { get; set; }
    }
}
