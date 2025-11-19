// File: WebApp/Models/Application/Services/IOrganizationService.cs
using WebApp.Models.Application.DTOs;

namespace WebApp.Models.Application.Services
{
    public interface IOrganizationService
    {
        Task<OrganizationDto> CreateAsync(CreateOrganizationRequest req);
        Task<OrganizationDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<OrganizationDto>> GetAllAsync();
        Task<IEnumerable<OrganizationDto>> SearchAsync(string? name, string? taxNumber);
        Task<OrganizationDto> UpdateAsync(Guid id, UpdateOrganizationRequest req);
        Task DeleteAsync(Guid id);
    }
}