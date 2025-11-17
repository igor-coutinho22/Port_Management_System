using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.Agents;

namespace WebApp.Models.Infrastructure.Repositories
{
    public class OrganizationRepository : IOrganizationRepository
    {
        private readonly PortManagementContext _context;
        public OrganizationRepository(PortManagementContext context) => _context = context;

        public Task<ShippingAgentOrganization?> GetByIdAsync(Guid id) =>
            _context.Organizations.Include(o => o.Representatives).FirstOrDefaultAsync(o => o.Id == id);

        public Task<ShippingAgentOrganization?> GetByTaxNumberAsync(string tax) =>
            _context.Organizations.FirstOrDefaultAsync(o => o.TaxNumber == tax);

        public async Task AddAsync(ShippingAgentOrganization org)
        {
            await _context.Organizations.AddAsync(org);
            await _context.SaveChangesAsync();
        }

        // listar com filtros
        public async Task<IEnumerable<ShippingAgentOrganization>> ListAsync(string? name, string? taxNumber)
        {
            var q = _context.Organizations.AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
                q = q.Where(o => o.LegalName.Contains(name) || o.AlternativeNames!.Contains(name));

            if (!string.IsNullOrWhiteSpace(taxNumber))
                q = q.Where(o => o.TaxNumber.Contains(taxNumber));

            return await q.OrderBy(o => o.LegalName).ToListAsync();
        }

        // update
        public async Task UpdateAsync(ShippingAgentOrganization org)
        {
            _context.Organizations.Update(org);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(ShippingAgentOrganization org)
        {
            _context.Organizations.Remove(org);
            await _context.SaveChangesAsync();
        }
    }
}
