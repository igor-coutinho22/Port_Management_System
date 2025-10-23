using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.Agents;

namespace WebApp.Models.Infrastructure.Repositories
{
    public class RepresentativeRepository : IRepresentativeRepository
    {
        private readonly PortManagementContext _ctx;
        public RepresentativeRepository(PortManagementContext ctx) => _ctx = ctx;

        public Task<Representative?> GetByIdAsync(Guid id) =>
            _ctx.Representatives.FirstOrDefaultAsync(r => r.Id == id);

        public async Task<IEnumerable<Representative>> ListByOrganizationAsync(Guid orgId, bool? active)
        {
            var q = _ctx.Representatives.AsQueryable().Where(r => r.OrganizationId == orgId);
            if (active.HasValue) q = q.Where(r => r.IsActive == active.Value);
            return await q.ToListAsync();
        }

        public async Task AddAsync(Representative rep)
        {
            await _ctx.Representatives.AddAsync(rep);
            await _ctx.SaveChangesAsync();
        }

        public async Task UpdateAsync(Representative rep)
        {
            _ctx.Representatives.Update(rep);
            await _ctx.SaveChangesAsync();
        }
    }
}
