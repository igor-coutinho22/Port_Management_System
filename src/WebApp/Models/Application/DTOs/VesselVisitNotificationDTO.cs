using WebApp.Models.Domain.VesselVisits;

namespace WebApp.Models.Application.DTOs
{
    public class VesselVisitNotificationDTO
    {
        public Guid Id { get; set; }
        public string? VesselIMO { get; set; }
        public Guid DockId { get; set; }
        public DateTime VisitDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Purpose { get; set; } = string.Empty;

        public CargoManifestDTO? LoadingManifest { get; set; }
        public CargoManifestDTO? UnloadingManifest { get; set; }
        public List<CrewMemberDTO> Crew { get; set; } = new();

        public DateTime? ArrivalTime { get; set; }
        public DateTime? DesiredDepartureTime { get; set; }
        public int? EstimatedLoadingDurationMinutes { get; set; }
        public int? EstimatedUnloadingDurationMinutes { get; set; }
    }


    public class CargoManifestDTO
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public List<ContainerDTO> Containers { get; set; } = new();
    }

    public class ContainerDTO
    {
        public string Identifier { get; set; } = string.Empty;
    }

    public class CrewMemberDTO
    {
        public string Name { get; set; } = string.Empty;
        public string CitizenId { get; set; } = string.Empty;
        public string Nationality { get; set; } = string.Empty;
    }

    public class RejectReasonDTO
    {
        public string Reason { get; set; } = string.Empty;
    }

    public class VesselVisitNotificationUpdateDTO
    {
        public Guid DockId { get; set; }
        public DateTime VisitDate { get; set; }
        public string Purpose { get; set; } = string.Empty;
    }

    public class VesselVisitNotificationFilterDTO
    {
        public string? VesselIMO { get; set; }
        public string? Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}
