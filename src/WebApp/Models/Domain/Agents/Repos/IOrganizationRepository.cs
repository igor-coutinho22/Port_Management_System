// File: WebApp/Models/Infrastructure/Repositories/IOrganizationRepository.cs
using WebApp.Models.Domain.Agents;

namespace WebApp.Models.Infrastructure.Repositories
{
    public interface IOrganizationRepository
    {
        Task<ShippingAgentOrganization?> GetByIdAsync(Guid id);
        Task<ShippingAgentOrganization?> GetByTaxNumberAsync(string taxNumber);
        Task AddAsync(ShippingAgentOrganization org);
        Task UpdateAsync(ShippingAgentOrganization org);
        Task DeleteAsync(ShippingAgentOrganization org);
        Task<IEnumerable<ShippingAgentOrganization>> GetAllAsync();
        Task<IEnumerable<ShippingAgentOrganization>> SearchAsync(string? name, string? taxNumber);
    }
}