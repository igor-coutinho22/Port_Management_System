// File: WebApp/Models/Infrastructure/Repositories/OrganizationRepository.cs
using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.Agents;

namespace WebApp.Models.Infrastructure.Repositories
{
    public class OrganizationRepository : IOrganizationRepository
    {
        private readonly PortManagementContext _context;

        public OrganizationRepository(PortManagementContext context)
        {
            _context = context;
        }

        public async Task<ShippingAgentOrganization?> GetByIdAsync(Guid id)
        {
            return await _context.Organizations
                .Include(o => o.Representatives)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<ShippingAgentOrganization?> GetByTaxNumberAsync(string taxNumber)
        {
            return await _context.Organizations
                .Include(o => o.Representatives)
                .FirstOrDefaultAsync(o => o.TaxNumber == taxNumber);
        }

        public async Task AddAsync(ShippingAgentOrganization org)
        {
            _context.Organizations.Add(org);
            await _context.SaveChangesAsync();
        }

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

        public async Task<List<ShippingAgentOrganization>> GetAllAsync()
        {
            return await _context.Organizations
                .Include(o => o.Representatives)
                .OrderBy(o => o.LegalName)
                .ToListAsync();
        }

        public async Task<List<ShippingAgentOrganization>> SearchAsync(string? name, string? taxNumber)
        {
            var query = _context.Organizations
                .Include(o => o.Representatives)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
            {
                var searchTerm = name.Trim();
                query = query.Where(o => 
                    o.LegalName.Contains(searchTerm) || 
                    (o.AlternativeNames != null && o.AlternativeNames.Contains(searchTerm)) ||
                    o.Identifier.Contains(searchTerm));
            }

            if (!string.IsNullOrWhiteSpace(taxNumber))
            {
                var taxTerm = taxNumber.Trim();
                query = query.Where(o => o.TaxNumber.Contains(taxTerm));
            }

            return await query
                .OrderBy(o => o.LegalName)
                .ToListAsync();
        }

        public async Task AddOrRemoveRepresentativeAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}