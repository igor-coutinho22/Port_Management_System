// File: WebApp/Models/Application/Services/IRepresentativeService.cs
using WebApp.Models.Application.DTOs;

namespace WebApp.Models.Application.Services
{
    public interface IRepresentativeService
    {
        Task<RepresentativeDto> CreateAsync(Guid orgId, CreateRepresentativeRequest req);
        Task<RepresentativeDto> UpdateAsync(Guid repId, UpdateRepresentativeRequest req);
        Task<IEnumerable<RepresentativeDto>> GetByOrganizationAsync(Guid orgId);
        Task<IEnumerable<RepresentativeDto>> GetAllAsync(Guid? orgId = null, bool? active = null);
        Task DeleteAsync(Guid repId);
    }
}