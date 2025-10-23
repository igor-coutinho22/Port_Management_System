namespace WebApp.Models.Application.DTOs
{
    // DTO to add or update a connection between storage area and a dock
    public record StorageAreaConnectionDTO(
        Guid DockId,
        double DistanceMeters,
        int TravelSeconds
    );
}
