using System.Threading.Tasks;
using WebApp.Models.Domain.Docks;
using WebApp.Models.Domain.StorageArea;

namespace WebApp.Models.Infrastructure.Repositories
{
    public interface IStorageAreaRepository
    {
        Task AddStorageAreaAsync(StorageArea storageArea);
        Task UpdateContainerYardAsync(ContainerYard yard, string name, int maxCapacityTeu, int currentOccupancyTeu, ICollection<Dock> docksServed);
        Task UpdateWarehouseAsync(Warehouse warehouse, string name, int maxCapacityTeu, int currentOccupancyTeu, string specializedCargoType);
        Task<StorageArea?> GetByNameAsync(string name);
        Task<StorageArea?> SearchByIdAsync(int id);
        Task<List<StorageArea>> GetAllAsync();
        
        // Connection CRUD between Dock and StorageArea
        Task AddConnectionAsync(int storageAreaId, int dockId, double distanceMeters, int travelSeconds);
        Task UpdateConnectionAsync(int storageAreaId, int dockId, double distanceMeters, int travelSeconds);
        Task<bool> RemoveConnectionAsync(int storageAreaId, int dockId);
        Task<List<DockStorageAreaInfo>> GetConnectionsForStorageAreaAsync(int storageAreaId);

        // Delete a storage area (and related persistent connection rows)
        Task DeleteStorageAreaAsync(int storageAreaId);
    }
}