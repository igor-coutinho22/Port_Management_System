using WebApp.Models.Application.DTOs;

namespace WebApp.Models.Application.Services
{
    public interface IOrganizationService
    {
        Task<OrganizationDto> CreateAsync(CreateOrganizationRequest req);
        Task<OrganizationDto> GetAsync(Guid id);

        Task<IEnumerable<OrganizationDto>> ListAsync(string? name, string? taxNumber);
        Task<OrganizationDto> UpdateAsync(Guid id, UpdateOrganizationRequest req);
        Task DeleteAsync(Guid id);
    }
}
