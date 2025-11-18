using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.Agents;

namespace WebApp.Models.Infrastructure.Repositories
{
    // Se já tiveres uma interface IOrganizationRepository, põe isto:
    // public class OrganizationRepository : IOrganizationRepository
    public class OrganizationRepository : IOrganizationRepository
    {
        private readonly PortManagementContext _context;

        public OrganizationRepository(PortManagementContext context)
        {
            _context = context;
        }

        // Obter por Id, sempre com Representatives incluídos
        public Task<ShippingAgentOrganization?> GetByIdAsync(Guid id) =>
            _context.Organizations
                .Include(o => o.Representatives)
                .FirstOrDefaultAsync(o => o.Id == id);

        // Obter por TaxNumber, também com Representatives (dá jeito no service/tests)
        public Task<ShippingAgentOrganization?> GetByTaxNumberAsync(string tax) =>
            _context.Organizations
                .Include(o => o.Representatives)
                .FirstOrDefaultAsync(o => o.TaxNumber == tax);

        // ✅ NOVO: verificar se já existe uma org com o mesmo TaxNumber (se quiseres usar isto em vez de GetByTaxNumberAsync)
        public async Task<bool> ExistsWithTaxNumberAsync(string taxNumber)
        {
            if (string.IsNullOrWhiteSpace(taxNumber)) return false;

            var t = taxNumber.Trim();
            return await _context.Organizations
                .AnyAsync(o => o.TaxNumber == t);
        }

        // Verificar se já existe uma org com o mesmo LegalName
        public async Task<bool> ExistsWithLegalNameAsync(string legalName)
        {
            if (string.IsNullOrWhiteSpace(legalName)) return false;

            var n = legalName.Trim();
            return await _context.Organizations
                .AnyAsync(o => o.LegalName == n);
        }

        // Verificar se já existe uma org com o mesmo AlternativeNames (quando preenchido)
        public async Task<bool> ExistsWithAlternativeNamesAsync(string alternativeNames)
        {
            if (string.IsNullOrWhiteSpace(alternativeNames)) return false;

            var n = alternativeNames.Trim();
            return await _context.Organizations
                .AnyAsync(o => o.AlternativeNames != null && o.AlternativeNames == n);
        }

        public async Task AddAsync(ShippingAgentOrganization org)
        {
            await _context.Organizations.AddAsync(org);
            await _context.SaveChangesAsync();
        }

        // Listar com filtros (nome / tax number) e com Representatives incluídos
        public async Task<IEnumerable<ShippingAgentOrganization>> ListAsync(string? name, string? taxNumber)
        {
            var q = _context.Organizations
                .Include(o => o.Representatives)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
            {
                var n = name.Trim();
                q = q.Where(o =>
                    o.LegalName.Contains(n) ||
                    (o.AlternativeNames != null && o.AlternativeNames.Contains(n)));
            }

            if (!string.IsNullOrWhiteSpace(taxNumber))
            {
                var t = taxNumber.Trim();
                q = q.Where(o => o.TaxNumber.Contains(t));
            }

            return await q
                .OrderBy(o => o.LegalName)
                .ToListAsync();
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
