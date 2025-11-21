// File: WebApp/Models/Application/Services/IOrganizationService.cs
using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Agents;

namespace WebApp.Models.Application.Services
{
    public interface IOrganizationService
    {
        Task CreateAsync(ShippingAgentOrganization org, List<Representative> representatives);
        Task<ShippingAgentOrganization?> GetByIdAsync(Guid id);
        Task<List<ShippingAgentOrganization>> GetAllAsync();
        Task<List<ShippingAgentOrganization>> SearchAsync(string? name, string? taxNumber);
        Task ActivateAsync(Guid id);
        Task DeactivateAsync(Guid id);
        Task AddRepresentativeAsync(Guid id, Representative rep);
        Task UpdateAsync(Guid id, ShippingAgentOrganization org);
        Task DeleteAsync(Guid id);
    }
}