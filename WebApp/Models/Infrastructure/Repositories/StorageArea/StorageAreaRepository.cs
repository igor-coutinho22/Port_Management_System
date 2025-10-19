using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.StorageArea;

using System.Threading.Tasks;

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

        public async Task UpdateDockAsync(Dock dock, string name, int maxCapacityTeu, int currentOccupancyTeu, int fixedStsCranesCount, int maxVesselLengthMeters)
        {
            if (_context.Entry(dock).State == EntityState.Detached)
            {
                _context.StorageAreas.Attach(dock);
            }

            dock.Name = name;
            dock.ChangeMaxCapacity(maxCapacityTeu);
            dock.UpdateCurrentOccupancy(currentOccupancyTeu);
            dock.UpdateStsCranesCount(fixedStsCranesCount);
            dock.UpdateMaxVesselLength(maxVesselLengthMeters);

            await _context.SaveChangesAsync();
        }

        public Task<StorageArea?> GetByNameAsync(string name)
        {
            // If needed distances eagerly, add .Include(sa => sa.Distances)
            return _context.StorageAreas
                .FirstOrDefaultAsync(sa => sa.Name == name);
        }

        public Task<StorageArea?> SearchByIdAsync(int id)
        {
            // Using FindAsync for PK lookup (returns tracked entity if already loaded)
            return _context.StorageAreas.FindAsync(id).AsTask();
        }

        public Task<List<StorageArea>> GetAllAsync()
        {
            return _context.StorageAreas.ToListAsync();
        }
    }
}