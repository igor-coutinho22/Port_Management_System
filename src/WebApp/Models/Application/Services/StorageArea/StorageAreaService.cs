using WebApp.Models.Domain.Docks;
using WebApp.Models.Domain.StorageArea;
using WebApp.Models.Infrastructure.Repositories;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Mappers;

namespace WebApp.Models.Application.Services
{
    public class StorageAreaService : IStorageAreaService
    {
        private readonly IStorageAreaRepository _storageAreaRepo;

        public StorageAreaService(IStorageAreaRepository storageAreaRepo)
        {
            _storageAreaRepo = storageAreaRepo;
        }

        public async Task AddContainerYardAsync(ContainerYard yard)
        {
            if (yard == null)
                throw new ArgumentNullException(nameof(yard));

            var existingYard = await GetStorageAreaByIdAsync(yard.Id) as ContainerYard;
            if (existingYard != null)
                throw new ArgumentException("A container yard with the same ID already exists.", nameof(yard.Id));
            
            await _storageAreaRepo.AddStorageAreaAsync(yard);
            
            // After saving, create DockConnections from DocksServed if there are any docks
            if (yard.DocksServed.Any())
            {
                yard.CreateConnectionsFromDocksServed();
                await _storageAreaRepo.UpdateContainerYardAsync(yard);
            }
        }

        public async Task AddWarehouseAsync(Warehouse warehouse)
        {
            if (warehouse == null)
                throw new ArgumentNullException(nameof(warehouse));

            var existingWarehouse = await GetStorageAreaByIdAsync(warehouse.Id) as Warehouse;
            if (existingWarehouse != null)
                throw new ArgumentException("A warehouse with the same ID already exists.", nameof(warehouse.Id));
            
            await _storageAreaRepo.AddStorageAreaAsync(warehouse);
        }

        public async Task UpdateContainerYardAsync(ContainerYard yard)
        {
            if (yard == null)
                throw new ArgumentNullException(nameof(yard));

            var existingYard = await GetStorageAreaByIdAsync(yard.Id) as ContainerYard;
            if (existingYard == null)
                throw new ArgumentException("Storage area not found or is not a container yard.");

            existingYard.Name = yard.Name;
            existingYard.ChangeMaxCapacity(yard.MaxCapacityTeu);
            existingYard.UpdateCurrentOccupancy(yard.CurrentOccupancyTeu);
            existingYard.DocksServed = yard.DocksServed;

            await _storageAreaRepo.UpdateContainerYardAsync(existingYard);
        }

        public async Task UpdateWarehouseAsync(Warehouse warehouse)
        {
            if (warehouse == null)
                throw new ArgumentNullException(nameof(warehouse));

            var existingWarehouse = await GetStorageAreaByIdAsync(warehouse.Id) as Warehouse;
            if (existingWarehouse == null)
                throw new ArgumentException("Storage area not found or is not a warehouse.");

            existingWarehouse.Name = warehouse.Name;
            existingWarehouse.ChangeMaxCapacity(warehouse.MaxCapacityTeu);
            existingWarehouse.UpdateCurrentOccupancy(warehouse.CurrentOccupancyTeu);
            existingWarehouse.UpdateCargoType(warehouse.SpecializedCargoType!);

            await _storageAreaRepo.UpdateWarehouseAsync(existingWarehouse);
        }

        public Task<StorageArea?> GetStorageAreaByNameAsync(string name) => _storageAreaRepo.GetByNameAsync(name);

        public Task<StorageArea?> GetStorageAreaByIdAsync(int id) => _storageAreaRepo.SearchByIdAsync(id);

        public Task<List<StorageArea>> GetAllStorageAreasAsync() => _storageAreaRepo.GetAllAsync();

        public async Task AddConnectionAsync(DockStorageAreaConnection connection)
        {
            if (connection == null)
                throw new ArgumentNullException(nameof(connection));

            if (connection.DistanceMeters < 0)
                throw new ArgumentException("Distance cannot be negative.", nameof(connection.DistanceMeters));

            if (connection.TravelSeconds < 0)
                throw new ArgumentException("Travel time cannot be negative.", nameof(connection.TravelSeconds));

            var storageArea = await GetStorageAreaByIdAsync(connection.StorageAreaId);
            if (storageArea == null)
                throw new ArgumentException("Storage area not found.", nameof(connection.StorageAreaId));

            storageArea.AddDockConnection(connection);
            await _storageAreaRepo.AddConnectionAsync(connection);
        }


        public async Task<DockStorageAreaConnection> UpdateConnectionFromDtoAsync(int storageAreaId, Guid dockId, DockStorageAreaConnectionDTO dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            // Get the existing connection
            var existingConnection = await GetConnectionAsync(storageAreaId, dockId);
            if (existingConnection == null)
                throw new ArgumentException($"Connection between storage area {storageAreaId} and dock {dockId} not found.");

            // Validate the DTO values
            if (dto.DistanceMeters < 0)
                throw new ArgumentException("Distance cannot be negative.", nameof(dto.DistanceMeters));
            if (dto.TravelSeconds < 0)
                throw new ArgumentException("Travel time cannot be negative.", nameof(dto.TravelSeconds));

            // Update the existing entity using mapper
            DockStorageAreaConnectionMapper.UpdateFromDto(existingConnection, dto);

            // Update through repository
            await _storageAreaRepo.UpdateConnectionAsync(existingConnection);
            
            return existingConnection;
        }
        
        public Task RemoveConnectionAsync(int storageAreaId, Guid dockId)
        {
            var connectionToDelete = GetConnectionAsync(storageAreaId, dockId).Result;
            if (connectionToDelete == null)
                throw new ArgumentException("Connection to this dock does not exist.", nameof(dockId));

            var storageArea = GetStorageAreaByIdAsync(storageAreaId).Result;
            if (storageArea == null)
                throw new ArgumentException("Storage area not found.", nameof(storageAreaId));

            storageArea.RemoveDockConnection(connectionToDelete);
            return _storageAreaRepo.RemoveConnectionAsync(connectionToDelete);
        }

        public Task<DockStorageAreaConnection?> GetConnectionAsync(int storageAreaId, Guid dockId)
            => _storageAreaRepo.GetConnectionAsync(storageAreaId, dockId);

        public Task<List<DockStorageAreaConnection>> GetConnectionsForStorageAreaAsync(int storageAreaId)
            => _storageAreaRepo.GetConnectionsForStorageAreaAsync(storageAreaId);

        public async Task DeleteStorageAreaAsync(int storageAreaId)
        {
            var storageAreaToDelete = await GetStorageAreaByIdAsync(storageAreaId);
            if (storageAreaToDelete == null)
                throw new ArgumentException("Storage area not found.", nameof(storageAreaId));

            // If this is a container yard, clear dock ContainerYardId foreign key references first
            if (storageAreaToDelete is ContainerYard)
            {
                await _storageAreaRepo.ClearContainerYardReferencesAsync(storageAreaId);
            }

            // Also clear any dock storage area connections
            var connections = await GetConnectionsForStorageAreaAsync(storageAreaId);
            foreach (var connection in connections)
            {
                await _storageAreaRepo.RemoveConnectionAsync(connection);
            }

            await _storageAreaRepo.DeleteStorageAreaAsync(storageAreaToDelete);
        }
    }
}