using System.Collections.Generic;
using System.Threading.Tasks;
using WebApp.Models.Domain.Docks;
using WebApp.Models.Domain.StorageArea;

namespace WebApp.Models.Application.Services
{
    public interface IStorageAreaService
    {
        Task AddContainerYardAsync(string name, int maxCapacityTeu, int currentOccupancyTeu, ICollection<Dock> docksServed);
        Task AddWarehouseAsync(string name, int maxCapacityTeu, int currentOccupancyTeu, string specializedCargoType);

        Task UpdateContainerYardAsync(int id, string name, int maxCapacityTeu, int currentOccupancyTeu, ICollection<Dock> docksServed);
        Task UpdateWarehouseAsync(int id, string name, int maxCapacityTeu, int currentOccupancyTeu, string specializedCargoType);

        Task<StorageArea?> GetStorageAreaByNameAsync(string name);
        Task<StorageArea?> GetStorageAreaByIdAsync(int id);
        Task<List<StorageArea>> GetAllStorageAreasAsync();
        
        // Connection CRUD
        Task AddConnectionAsync(int storageAreaId, Guid dockId, double distanceMeters, int travelSeconds);
        Task UpdateConnectionAsync(int storageAreaId, Guid dockId, double distanceMeters, int travelSeconds);
        Task<bool> RemoveConnectionAsync(int storageAreaId, Guid dockId);
        Task<List<DockStorageAreaInfo>> GetConnectionsForStorageAreaAsync(int storageAreaId);

        // Delete storage area
        Task DeleteStorageAreaAsync(int storageAreaId);
    }
}