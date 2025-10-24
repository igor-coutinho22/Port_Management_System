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
            return await _context.StorageAreas
                .OfType<Dock>()
                .Include(d => d.AllowedVesselTypes)
                .FirstOrDefaultAsync(d => d.Id == id);
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

        public async Task<IEnumerable<Dock>> SearchAsync(string? name, string? location, string? vesselTypeName)
        {
            var query = _context.StorageAreas.OfType<Dock>().Include(d => d.AllowedVesselTypes).AsQueryable();

            if (!string.IsNullOrEmpty(name))
                query = query.Where(d => d.Name.Contains(name));

            if (!string.IsNullOrEmpty(location))
                query = query.Where(d => d.Location.Contains(location));

            if (vesselTypeName != null)
                query = query.Where(d => d.AllowedVesselTypes.Any(vt => vt.Name == vesselTypeName));

            return await query.ToListAsync();
        }
    }
}