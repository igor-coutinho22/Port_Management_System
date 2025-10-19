using System.Threading.Tasks;
using WebApp.Models.Domain.StorageArea;

namespace WebApp.Models.Infrastructure.Repositories
{
    public interface IStorageAreaRepository
    {
        Task AddStorageAreaAsync(StorageArea storageArea);
        Task UpdateContainerYardAsync(ContainerYard yard, string name, int maxCapacityTeu, int currentOccupancyTeu, ICollection<Dock> docksServed);
        Task UpdateWarehouseAsync(Warehouse warehouse, string name, int maxCapacityTeu, int currentOccupancyTeu, string specializedCargoType);
        Task UpdateDockAsync(Dock dock, string name, int maxCapacityTeu, int currentOccupancyTeu, int fixedStsCranesCount, int maxVesselLengthMeters);
        Task<StorageArea?> GetByNameAsync(string name);
        Task<StorageArea?> SearchByIdAsync(int id);
        Task<List<StorageArea>> GetAllAsync();
    }
}