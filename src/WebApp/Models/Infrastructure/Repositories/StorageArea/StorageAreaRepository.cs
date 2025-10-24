using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.StorageArea;

using WebApp.Models.Domain.Docks;

namespace WebApp.Models.Infrastructure.Repositories
{
    public class StorageAreaRepository : IStorageAreaRepository
    {
        private readonly PortManagementContext _context;

        public StorageAreaRepository(PortManagementContext context)
        {
            _context = context;
        }

        public async Task AddStorageAreaAsync(StorageArea storageArea)
        {
            // Enforce unique name (DB collation may already be case-insensitive)
            if (await _context.StorageAreas.AnyAsync(sa => sa.Name == storageArea.Name))
                throw new ArgumentException("A storage area with this name already exists.");

            await _context.StorageAreas.AddAsync(storageArea);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateContainerYardAsync(ContainerYard yard, string name, int maxCapacityTeu, int currentOccupancyTeu, ICollection<Dock> docksServed)
        {
            // Ensure the entity is tracked
            if (_context.Entry(yard).State == EntityState.Detached)
            {
                _context.StorageAreas.Attach(yard);
            }

            yard.Name = name;
            yard.ChangeMaxCapacity(maxCapacityTeu);
            yard.UpdateCurrentOccupancy(currentOccupancyTeu);
            yard.DocksServed = docksServed;

            await _context.SaveChangesAsync();
        }

        public async Task UpdateWarehouseAsync(Warehouse warehouse, string name, int maxCapacityTeu, int currentOccupancyTeu, string specializedCargoType)
        {
            if (_context.Entry(warehouse).State == EntityState.Detached)
            {
                _context.StorageAreas.Attach(warehouse);
            }

            warehouse.Name = name;
            warehouse.ChangeMaxCapacity(maxCapacityTeu);
            warehouse.UpdateCurrentOccupancy(currentOccupancyTeu);
            warehouse.UpdateCargoType(specializedCargoType);

            await _context.SaveChangesAsync();
        }

        public Task<StorageArea?> GetByNameAsync(string name)
        {
            return _context.StorageAreas
                .Include(sa => sa.DockConnections)
                .FirstOrDefaultAsync(sa => sa.Name == name);
        }

        public Task<StorageArea?> SearchByIdAsync(int id)
        {
            return _context.StorageAreas
                .Include(sa => sa.DockConnections)
                .FirstOrDefaultAsync(sa => sa.Id == id);
        }

        public Task<List<StorageArea>> GetAllAsync()
        {
            return _context.StorageAreas
                .Include(sa => sa.DockConnections)
                .ToListAsync();
        }

    public async Task AddConnectionAsync(int storageAreaId, Guid dockId, double distanceMeters, int travelSeconds)
        {
            // ensure StorageArea exists
            var sa = await _context.StorageAreas.FindAsync(storageAreaId);
            if (sa == null) throw new ArgumentException("StorageArea not found", nameof(storageAreaId));

            // upsert: if exists, return error
            var existing = await _context.DockStorageAreaInfos
                .FirstOrDefaultAsync(d => d.StorageAreaId == storageAreaId && d.DockId == dockId);

            if (existing != null)
            {
                throw new ArgumentException("Connection already exists");
            }
            else
            {
                var info = new DockStorageAreaInfo
                {
                    StorageAreaId = storageAreaId,
                    DockId = dockId,
                    DistanceMeters = distanceMeters,
                    TravelSeconds = travelSeconds
                };
                await _context.DockStorageAreaInfos.AddAsync(info);
            }

            await _context.SaveChangesAsync();
        }

        public async Task UpdateConnectionAsync(int storageAreaId, Guid dockId, double distanceMeters, int travelSeconds)
        {
            var existing = await _context.DockStorageAreaInfos
                .FirstOrDefaultAsync(d => d.StorageAreaId == storageAreaId && d.DockId == dockId);

            if (existing == null) throw new ArgumentException("Connection not found");

            existing.DistanceMeters = distanceMeters;
            existing.TravelSeconds = travelSeconds;

            await _context.SaveChangesAsync();
        }

        public async Task<bool> RemoveConnectionAsync(int storageAreaId, Guid dockId)
        {
            var existing = await _context.DockStorageAreaInfos
                .FirstOrDefaultAsync(d => d.StorageAreaId == storageAreaId && d.DockId == dockId);

            if (existing == null) return false;

            _context.DockStorageAreaInfos.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }

        public Task<List<DockStorageAreaInfo>> GetConnectionsForStorageAreaAsync(int storageAreaId)
        {
            return _context.DockStorageAreaInfos
                .Where(d => d.StorageAreaId == storageAreaId)
                .ToListAsync();
        }

        public async Task DeleteStorageAreaAsync(int storageAreaId)
        {
            var sa = await _context.StorageAreas.FindAsync(storageAreaId);
            if (sa == null) throw new ArgumentException("StorageArea not found", nameof(storageAreaId));

            // remove associated DockStorageAreaInfo rows first (FKs might cascade depending on configuration)
            var connections = _context.DockStorageAreaInfos.Where(d => d.StorageAreaId == storageAreaId);
            _context.DockStorageAreaInfos.RemoveRange(connections);

            _context.StorageAreas.Remove(sa);
            await _context.SaveChangesAsync();
        }
    }
}