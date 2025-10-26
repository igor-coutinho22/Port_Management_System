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

        public async Task UpdateContainerYardAsync(ContainerYard yard)
        {
            // Ensure the entity is tracked
            if (_context.Entry(yard).State == EntityState.Detached)
            {
                _context.StorageAreas.Attach(yard);
            }

            _context.StorageAreas.Update(yard);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateWarehouseAsync(Warehouse warehouse)
        {
            if (_context.Entry(warehouse).State == EntityState.Detached)
            {
                _context.StorageAreas.Attach(warehouse);
            }

            _context.StorageAreas.Update(warehouse);    
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

    public async Task AddConnectionAsync(DockStorageAreaConnection connection)
        {
            await _context.DockStorageAreaConnections.AddAsync(connection);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateConnectionAsync(DockStorageAreaConnection connection)
        {
            _context.DockStorageAreaConnections.Update(connection);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveConnectionAsync(DockStorageAreaConnection connection)
        {
            _context.DockStorageAreaConnections.Remove(connection);
            await _context.SaveChangesAsync();
        }

        public Task<DockStorageAreaConnection?> GetConnectionAsync(int storageAreaId, Guid dockId)
        {
            return _context.DockStorageAreaConnections
                .Where(d => d.StorageAreaId == storageAreaId && d.DockId == dockId)
                .FirstOrDefaultAsync();
        }

        public Task<List<DockStorageAreaConnection>> GetConnectionsForStorageAreaAsync(int storageAreaId)
        {
            return _context.DockStorageAreaConnections
                .Where(d => d.StorageAreaId == storageAreaId)
                .ToListAsync();
        }

        public async Task DeleteStorageAreaAsync(StorageArea storageArea)
        {
            _context.StorageAreas.Remove(storageArea);
            await _context.SaveChangesAsync();
        }
    }
}