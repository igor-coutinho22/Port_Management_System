namespace WebApp.Models.Domain.Scheduling
{
    public class VesselScheduleEntry
    {
        public Guid VesselVisitId { get; set; }
        public string VesselIMO { get; set; } = default!;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        public string? AssignedCraneId { get; set; }
        public List<string> StaffMecNumbers { get; set; } = new();
        public double DelayMinutes { get; set; }  
    }
}
