using PortManagement.Domain.Enums;
using WebApp.Models.Domain.StorageArea;

namespace WebApp.Models.Application.DTOs
{
    public class StorageAreaDTO
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public StorageAreaType? Type { get; set; }
        public int MaxCapacityTeu { get; set; }
        public int CurrentOccupancyTeu { get; set; }
        public required ICollection<DockStorageAreaConnection> DockConnections { get; set; }
    }
}