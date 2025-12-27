namespace Oem.Models.Application.DTOs
{
    public class CreateVesselVisitExecutionDTO
    {
        public Guid VesselVisitId { get; set; }
        public string VesselIMO { get; set; } = string.Empty;
        public DateTime ActualArrivalTime { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
    }
}
