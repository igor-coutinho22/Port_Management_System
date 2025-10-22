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
    }
}
