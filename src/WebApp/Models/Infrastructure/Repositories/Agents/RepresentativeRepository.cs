// File: WebApp/Models/Infrastructure/Repositories/RepresentativeRepository.cs
using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.Agents;

namespace WebApp.Models.Infrastructure.Repositories
{
    public class RepresentativeRepository : IRepresentativeRepository
    {
        private readonly PortManagementContext _context;

        public RepresentativeRepository(PortManagementContext context)
        {
            _context = context;
        }

        public async Task<Representative?> GetByIdAsync(Guid id)
        {
            return await _context.Representatives
                .Include(r => r.Organization)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Representative>> GetByOrganizationAsync(Guid orgId)
        {
            return await _context.Representatives
                .Where(r => r.OrganizationId == orgId)
                .OrderBy(r => r.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<Representative>> GetAllAsync(Guid? orgId = null, bool? active = null)
        {
            var query = _context.Representatives.AsQueryable();

            if (orgId.HasValue)
                query = query.Where(r => r.OrganizationId == orgId.Value);

            if (active.HasValue)
                query = query.Where(r => r.IsActive == active.Value);

            return await query
                .OrderBy(r => r.Name)
                .ToListAsync();
        }

        public async Task AddAsync(Representative rep)
        {
            await _context.Representatives.AddAsync(rep);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Representative rep)
        {
            _context.Representatives.Update(rep);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Representative rep)
        {
            _context.Representatives.Remove(rep);
            await _context.SaveChangesAsync();
        }
    }
}