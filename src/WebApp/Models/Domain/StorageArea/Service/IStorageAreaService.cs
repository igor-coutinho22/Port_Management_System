using System.Collections.Generic;
using System.ComponentModel;
using System.Threading.Tasks;
using WebApp.Models.Domain.Docks;
using WebApp.Models.Domain.StorageArea;
using WebApp.Models.Application.DTOs;

namespace WebApp.Models.Application.Services
{
    public interface IStorageAreaService
    {
        Task AddContainerYardAsync(ContainerYard yard);
        Task AddWarehouseAsync(Warehouse warehouse);

        Task UpdateContainerYardAsync(ContainerYard yard);
        Task UpdateWarehouseAsync(Warehouse warehouse);

        Task<StorageArea?> GetStorageAreaByNameAsync(string name);
        Task<StorageArea?> GetStorageAreaByIdAsync(int id);
        Task<List<StorageArea>> GetAllStorageAreasAsync();
        
        // Connection CRUD
        Task AddConnectionAsync(DockStorageAreaConnection connection);
        Task<DockStorageAreaConnection> UpdateConnectionFromDtoAsync(int storageAreaId, Guid dockId, DockStorageAreaConnectionDTO dto);
        Task RemoveConnectionAsync(int storageAreaId, Guid dockId);
        Task<DockStorageAreaConnection?> GetConnectionAsync(int storageAreaId, Guid dockId);
        Task<List<DockStorageAreaConnection>> GetConnectionsForStorageAreaAsync(int storageAreaId);

        // Delete storage area
        Task DeleteStorageAreaAsync(int storageAreaId);
    }
}