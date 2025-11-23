// File: WebApp/Models/Application/Services/IRepresentativeService.cs
using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Agents;

namespace WebApp.Models.Application.Services
{
    public interface IRepresentativeService
    {
        Task CreateAsync(Guid orgId, Representative rep);
        Task UpdateAsync(Guid repId, Representative rep);
        Task<List<Representative>> GetByOrganizationIdAsync(Guid orgId);
        Task<Representative?> GetByIdAsync(Guid repId);
        Task<List<Representative>> GetAllAsync();
        Task ActivateAsync(Guid repId);
        Task DeactivateAsync(Guid repId);
    }
}