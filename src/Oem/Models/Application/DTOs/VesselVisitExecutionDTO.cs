namespace Oem.Models.Application.DTOs
{
    public class VesselVisitExecutionDTO
    {
        public Guid Id { get; set; }
        public Guid VesselVisitId { get; set; }
        public string VesselIMO { get; set; } = string.Empty;
        public DateTime ActualArrivalTime { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
