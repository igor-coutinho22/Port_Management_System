using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.Docks;
using WebApp.Models.Domain.StorageArea;

namespace WebApp.Models.Infrastructure.Repositories
{
    public class DockRepository : IDockRepository
    {
        private readonly PortManagementContext _context;

        public DockRepository(PortManagementContext context)
        {
            _context = context;
        }

        public async Task<Dock?> GetByIdAsync(Guid id)
        {
            return await _context.Docks
                .Include(d => d.AllowedVesselTypes)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<Dock?> GetByNameAsync(string name)
        {
            return await _context.Docks
                .Include(d => d.AllowedVesselTypes)
                .FirstOrDefaultAsync(d => d.Name == name);
        }

        public async Task<Dock?> GetByLocationAsync(string location)
        {
            return await _context.Docks
                .Include(d => d.AllowedVesselTypes)
                .FirstOrDefaultAsync(d => d.Location == location);
        }

        public async Task AddAsync(Dock dock)
        {
            _context.Docks.Add(dock);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Dock dock)
        {
            _context.Docks.Update(dock);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Dock>> SearchByVesselTypeAsync(string vesselTypeName)
        {
            return await _context.Docks
                .Include(d => d.AllowedVesselTypes)
                .Where(d => d.AllowedVesselTypes.Any(vt => vt.Name.Contains(vesselTypeName)))
                .ToListAsync();
        }

        public async Task<List<Dock>> SearchByLocationAsync(string location)
        {
            return await _context.Docks
                .Where(d => d.Location.Contains(location))
                .ToListAsync();
        }

        public async Task<List<Dock>> SearchByNameAsync(string name)
        {
            return await _context.Docks
                .Where(d => d.Name.Contains(name))
                .ToListAsync();
        }

        public async Task<List<Dock>> GetAllAsync()
        {
            return await _context.Docks
                .Include(d => d.AllowedVesselTypes)
                .ToListAsync();
        }

        public async Task DeleteAsync(Dock dock)
        {
            _context.Docks.Remove(dock);
            await _context.SaveChangesAsync();
        }
    }
}