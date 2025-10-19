using System.Collections.Generic;
using System.Threading.Tasks;
using WebApp.Models.Domain.StorageArea;

namespace WebApp.Models.Application.Services
{
    public interface IStorageAreaService
    {
        Task AddContainerYardAsync(string name, int maxCapacityTeu, int currentOccupancyTeu, ICollection<Dock> docksServed);
        Task AddWarehouseAsync(string name, int maxCapacityTeu, int currentOccupancyTeu, string specializedCargoType);
        Task AddDockAsync(string name, int maxCapacityTeu, int currentOccupancyTeu, int fixedStsCranesCount, int maxVesselLengthMeters);

        Task UpdateContainerYardAsync(int id, string name, int maxCapacityTeu, int currentOccupancyTeu, ICollection<Dock> docksServed);
        Task UpdateWarehouseAsync(int id, string name, int maxCapacityTeu, int currentOccupancyTeu, string specializedCargoType);
        Task UpdateDockAsync(int id, string name, int maxCapacityTeu, int currentOccupancyTeu, int fixedStsCranesCount, int maxVesselLengthMeters);

        Task<StorageArea?> GetStorageAreaByNameAsync(string name);
        Task<StorageArea?> GetStorageAreaByIdAsync(int id);
        Task<List<StorageArea>> GetAllStorageAreasAsync();
    }
}