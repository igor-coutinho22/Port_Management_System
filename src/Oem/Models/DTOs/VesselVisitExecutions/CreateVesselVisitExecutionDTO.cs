namespace Oem.Models.DTOs.VesselVisitExecutions
{
    public class CreateVesselVisitExecutionDTO
    {
        public Guid VesselVisitId { get; set; }
        public string VesselIdentifier { get; set; } = string.Empty;
        public DateTime ActualArrivalTime { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
    }
}
