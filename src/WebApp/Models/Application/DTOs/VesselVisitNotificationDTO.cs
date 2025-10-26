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
    }

    public class CargoManifestDTO
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty;
    }

    public class CrewMemberDTO
    {
        public string Name { get; set; } = string.Empty;
        public string CitizenId { get; set; } = string.Empty;
        public string Nationality { get; set; } = string.Empty;
    }
        public class VesselVisitNotificationFilterDTO
    {
        public string? VesselIMO { get; set; }
        public string? Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? Representative { get; set; }
    }
}
