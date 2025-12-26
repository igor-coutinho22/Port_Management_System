namespace Oem.Models.Domain.VesselVisitExecutions
{
    public class VesselVisitExecution
    {
        public Guid Id { get; private set; }
        public Guid VesselVisitId { get; private set; }
        public string VesselIdentifier { get; private set; } = string.Empty;
        public DateTime ActualArrivalTime { get; private set; }
        public string CreatedBy { get; private set; } = string.Empty;
        public DateTime CreatedAt { get; private set; }
        public string Status { get; private set; } = "In Progress";

        protected VesselVisitExecution() { }

        public VesselVisitExecution(Guid vesselVisitId, string vesselIdentifier, DateTime actualArrivalTime, string createdBy)
        {
            Id = Guid.NewGuid();
            VesselVisitId = vesselVisitId;
            VesselIdentifier = vesselIdentifier;
            ActualArrivalTime = actualArrivalTime;
            CreatedBy = createdBy;
            CreatedAt = DateTime.UtcNow;
            Status = "In Progress";
        }

        public void Complete()
        {
            Status = "Completed";
        }
    }
}
