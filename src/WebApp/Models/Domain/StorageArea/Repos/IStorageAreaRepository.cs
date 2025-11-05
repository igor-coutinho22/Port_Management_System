using System.Threading.Tasks;
using WebApp.Models.Domain.Docks;
using WebApp.Models.Domain.StorageArea;

namespace WebApp.Models.Infrastructure.Repositories
{
    public interface IStorageAreaRepository
    {
        Task AddStorageAreaAsync(StorageArea storageArea);
        Task UpdateContainerYardAsync(ContainerYard yard);
        Task UpdateWarehouseAsync(Warehouse warehouse);
        Task<StorageArea?> GetByNameAsync(string name);
        Task<StorageArea?> SearchByIdAsync(int id);
        Task<List<StorageArea>> GetAllAsync();
        
        // Connection CRUD between Dock and StorageArea
        Task AddConnectionAsync(DockStorageAreaConnection connection);
        Task UpdateConnectionAsync(DockStorageAreaConnection connection);
        Task RemoveConnectionAsync(DockStorageAreaConnection connection);
        Task<DockStorageAreaConnection?> GetConnectionAsync(int storageAreaId, Guid dockId);
        Task<List<DockStorageAreaConnection>> GetConnectionsForStorageAreaAsync(int storageAreaId);

        // Delete a storage area (and related persistent connection rows)
        Task DeleteStorageAreaAsync(StorageArea storageArea);
        
        // Clear ContainerYardId references in docks table
        Task ClearContainerYardReferencesAsync(int containerYardId);
    }
}