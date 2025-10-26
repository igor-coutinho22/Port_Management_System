namespace WebApp.Models.Application.DTOs
{
    // DTO to add or update a connection between storage area and a dock
    public class DockStorageAreaConnectionDTO
    {
        public Guid DockId { get; set; }
        public int StorageAreaId { get; set; }
        public double DistanceMeters { get; set; }
        public int TravelSeconds { get; set; }
    }
}
