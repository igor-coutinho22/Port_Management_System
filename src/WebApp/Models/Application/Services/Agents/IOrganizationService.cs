using WebApp.Models.Application.DTOs;

namespace WebApp.Models.Application.Services
{
    public interface IOrganizationService
    {
        Task<OrganizationDto> CreateAsync(CreateOrganizationRequest req);
        Task<OrganizationDto> GetAsync(Guid id);
    }
}
