using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Agents;
using WebApp.Models.Infrastructure.Repositories;

namespace WebApp.Models.Application.Services
{
    public class RepresentativeService : IRepresentativeService
    {
        private readonly IOrganizationRepository _orgRepo;
        private readonly IRepresentativeRepository _repRepo;

        public RepresentativeService(IOrganizationRepository orgRepo, IRepresentativeRepository repRepo)
        { _orgRepo = orgRepo; _repRepo = repRepo; }

        public async Task<RepresentativeDto> CreateAsync(Guid orgId, CreateRepresentativeRequest req)
        {
            _ = await _orgRepo.GetByIdAsync(orgId) ?? throw new KeyNotFoundException("Organization not found.");
            var rep = new Representative(orgId, req.Name, req.CitizenId, req.Nationality, req.Email, req.Phone);
            await _repRepo.AddAsync(rep);
            return Map(rep);
        }

        public async Task<RepresentativeDto> UpdateAsync(Guid repId, UpdateRepresentativeRequest req)
        {
            var rep = await _repRepo.GetByIdAsync(repId) ?? throw new KeyNotFoundException("Representative not found.");
            rep.Update(req.Name, req.CitizenId, req.Nationality, req.Email, req.Phone);
            await _repRepo.UpdateAsync(rep);
            return Map(rep);
        }

        public async Task SetActiveAsync(Guid repId, bool isActive)
        {
            var rep = await _repRepo.GetByIdAsync(repId) ?? throw new KeyNotFoundException("Representative not found.");
            rep.SetActive(isActive);
            await _repRepo.UpdateAsync(rep);
        }

        public async Task<IEnumerable<RepresentativeDto>> ListAsync(Guid orgId, bool? active)
        {
            _ = await _orgRepo.GetByIdAsync(orgId) ?? throw new KeyNotFoundException("Organization not found.");
            var reps = await _repRepo.ListByOrganizationAsync(orgId, active);
            return reps.Select(Map);
        }

        private static RepresentativeDto Map(Representative r) =>
            new(r.Id, r.OrganizationId, r.Name, r.CitizenId, r.Nationality, r.Email, r.Phone, r.IsActive);
    }
}
