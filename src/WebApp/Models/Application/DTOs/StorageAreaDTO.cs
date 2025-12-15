using PortManagement.Domain.Enums;

namespace WebApp.Models.Application.DTOs
{
    public class StorageAreaDTO
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public StorageAreaType Type { get; set; }

        public int MaxCapacityTeu { get; set; }

        // Derived from containers on the domain side
        public int CurrentOccupancyTeu { get; set; }

        public ICollection<DockStorageAreaConnectionDTO> DockConnections { get; set; }
            = new List<DockStorageAreaConnectionDTO>();
    }
}
