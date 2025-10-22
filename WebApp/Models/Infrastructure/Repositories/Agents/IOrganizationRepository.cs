using WebApp.Models.Domain.Agents;

namespace WebApp.Models.Infrastructure.Repositories
{
    public interface IOrganizationRepository
    {
        Task<ShippingAgentOrganization?> GetByIdAsync(Guid id);
        Task<ShippingAgentOrganization?> GetByTaxNumberAsync(string taxNumber);
        Task AddAsync(ShippingAgentOrganization org);
    }
}
