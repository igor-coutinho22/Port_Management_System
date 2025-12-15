namespace Oem.Models.Application.DTOs
{
    public class VesselScheduleEntryDTO
    {
        public Guid VesselVisitId { get; set; }
        public string VesselIMO { get; set; } = default!;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        public string? AssignedCraneId { get; set; }

        public int NumberOfCranes { get; set; } = 1;

        public List<string> StaffMecNumbers { get; set; } = new();

        public double DelayMinutes { get; set; }
    }
}