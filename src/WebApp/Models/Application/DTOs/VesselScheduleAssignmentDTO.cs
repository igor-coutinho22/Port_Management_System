using System;

namespace WebApp.Models.Application.DTOs
{
    public class VesselScheduleAssignmentDTO
    {
        public Guid VesselVisitId { get; set; }
        public Guid DockId { get; set; }

        public DateTime ArrivalTime { get; set; }
        public DateTime DepartureTime { get; set; }
    }
}
