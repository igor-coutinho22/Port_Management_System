namespace Oem.Models.DTOs.OperationPlans
{
    public class OperationPlanItemDTO
    {
        public Guid Id { get; set; }
        public Guid VesselVisitId { get; set; }
        public string VesselIMO { get; set; } = string.Empty;
        
        // The detailed windows
        public DateTime ServiceStartTime { get; set; }
        public DateTime ServiceEndTime { get; set; }
        
        public DateTime UnloadingStartTime { get; set; }
        public DateTime UnloadingEndTime { get; set; }
        
        public DateTime LoadingStartTime { get; set; }
        public DateTime LoadingEndTime { get; set; }
        
        public int NumberOfCranes { get; set; }
        public int NumberOfStaff { get; set; }
    
    }
}