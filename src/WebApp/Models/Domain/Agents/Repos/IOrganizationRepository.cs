using WebApp.Models.Domain.Agents;

namespace WebApp.Models.Infrastructure.Repositories
{
    public interface IOrganizationRepository
    {
        Task<ShippingAgentOrganization?> GetByIdAsync(Guid id);
        Task<ShippingAgentOrganization?> GetByTaxNumberAsync(string taxNumber);
        Task AddAsync(ShippingAgentOrganization org);

        Task<IEnumerable<ShippingAgentOrganization>> ListAsync(string? name, string? taxNumber);
        Task UpdateAsync(ShippingAgentOrganization org);
        Task DeleteAsync(ShippingAgentOrganization org);
    }
}
