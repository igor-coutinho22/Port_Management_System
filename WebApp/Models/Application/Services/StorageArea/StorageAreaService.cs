using WebApp.Models.Domain.Docks;
using WebApp.Models.Domain.StorageArea;
using WebApp.Models.Infrastructure.Repositories;

namespace WebApp.Models.Application.Services
{
    public class StorageAreaService : IStorageAreaService
    {
        private readonly IStorageAreaRepository _storageAreaRepo;

        public StorageAreaService(IStorageAreaRepository storageAreaRepo)
        {
            _storageAreaRepo = storageAreaRepo;
        }

        public async Task AddContainerYardAsync(string name, int maxCapacityTeu, int currentOccupancyTeu, ICollection<Dock> docksServed)
        {
            var yard = new ContainerYard(name, maxCapacityTeu, currentOccupancyTeu, docksServed);
            await _storageAreaRepo.AddStorageAreaAsync(yard);
        }

        public async Task AddWarehouseAsync(string name, int maxCapacityTeu, int currentOccupancyTeu, string specializedCargoType)
        {
            var warehouse = new Warehouse(name, maxCapacityTeu, currentOccupancyTeu, specializedCargoType);
            await _storageAreaRepo.AddStorageAreaAsync(warehouse);
        }
        
        public async Task UpdateContainerYardAsync(int id, string name, int maxCapacityTeu, int currentOccupancyTeu, ICollection<Dock> docksServed)
        {
            var yard = await GetStorageAreaByIdAsync(id) as ContainerYard;
            if (yard == null)
                throw new ArgumentException("Storage area not found or is not a container yard.");
            await _storageAreaRepo.UpdateContainerYardAsync(yard, name, maxCapacityTeu, currentOccupancyTeu, docksServed);
        }

        public async Task UpdateWarehouseAsync(int id, string name, int maxCapacityTeu, int currentOccupancyTeu, string specializedCargoType)
        {
            var warehouse = await GetStorageAreaByIdAsync(id) as Warehouse;
            if (warehouse == null)
                throw new ArgumentException("Storage area not found or is not a warehouse.");
            await _storageAreaRepo.UpdateWarehouseAsync(warehouse, name, maxCapacityTeu, currentOccupancyTeu, specializedCargoType);
        }

        public Task<StorageArea?> GetStorageAreaByNameAsync(string name) => _storageAreaRepo.GetByNameAsync(name);

        public Task<StorageArea?> GetStorageAreaByIdAsync(int id) => _storageAreaRepo.SearchByIdAsync(id);

        public Task<List<StorageArea>> GetAllStorageAreasAsync() => _storageAreaRepo.GetAllAsync();

        public Task AddConnectionAsync(int storageAreaId, int dockId, double distanceMeters, int travelSeconds)
            => _storageAreaRepo.AddConnectionAsync(storageAreaId, dockId, distanceMeters, travelSeconds);

        public Task UpdateConnectionAsync(int storageAreaId, int dockId, double distanceMeters, int travelSeconds)
            => _storageAreaRepo.UpdateConnectionAsync(storageAreaId, dockId, distanceMeters, travelSeconds);

        public Task<bool> RemoveConnectionAsync(int storageAreaId, int dockId)
            => _storageAreaRepo.RemoveConnectionAsync(storageAreaId, dockId);

        public Task<List<DockStorageAreaInfo>> GetConnectionsForStorageAreaAsync(int storageAreaId)
            => _storageAreaRepo.GetConnectionsForStorageAreaAsync(storageAreaId);

        public Task DeleteStorageAreaAsync(int storageAreaId)
            => _storageAreaRepo.DeleteStorageAreaAsync(storageAreaId);
    }
}