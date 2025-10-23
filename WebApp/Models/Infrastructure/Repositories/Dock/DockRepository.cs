using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
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
            _context.StorageAreas.Add(dock);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Dock dock)
        {
            _context.StorageAreas.Update(dock);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Dock>> SearchAsync(string? name, string? location, Guid? vesselTypeId)
        {
            var query = _context.StorageAreas.OfType<Dock>().Include(d => d.AllowedVesselTypes).AsQueryable();

            if (!string.IsNullOrEmpty(name))
                query = query.Where(d => d.Name.Contains(name));

            if (!string.IsNullOrEmpty(location))
                query = query.Where(d => d.Location.Contains(location));

            if (vesselTypeId.HasValue)
                query = query.Where(d => d.AllowedVesselTypes.Any(v => v.Id == vesselTypeId.Value));

            return await query.ToListAsync();
        }
    }
}