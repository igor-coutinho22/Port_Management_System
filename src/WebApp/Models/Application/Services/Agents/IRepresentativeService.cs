using WebApp.Models.Application.DTOs;

namespace WebApp.Models.Application.Services
{
    public interface IRepresentativeService
    {
        Task<RepresentativeDto> CreateAsync(Guid orgId, CreateRepresentativeRequest req);
        Task<RepresentativeDto> UpdateAsync(Guid repId, UpdateRepresentativeRequest req);
        Task SetActiveAsync(Guid repId, bool isActive);
        Task<IEnumerable<RepresentativeDto>> ListAsync(Guid orgId, bool? active);
        Task<IEnumerable<RepresentativeDto>> ListAllAsync(Guid? orgId, bool? active);
    }
}
