using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Mappers;
using WebApp.Models.Domain.Agents;
using WebApp.Models.Infrastructure.Repositories;

namespace WebApp.Models.Application.Services.Agents
{
    public class RepresentativeService : IRepresentativeService
    {
        private readonly IOrganizationRepository _orgRepo;
        private readonly IRepresentativeRepository _repRepo;

        public RepresentativeService(
            IOrganizationRepository orgRepo,
            IRepresentativeRepository repRepo)
        {
            _orgRepo = orgRepo;
            _repRepo = repRepo;
        }


        public async Task<RepresentativeDto> CreateAsync(Guid orgId, CreateRepresentativeRequest req)
        {
            var org = await _orgRepo.GetByIdAsync(orgId)
                      ?? throw new KeyNotFoundException("Organization not found.");

            var rep = new Representative(
                orgId,
                req.Name,
                req.CitizenId,
                req.Nationality,
                req.Email,
                req.Phone
            );

            // Usa as regras do domínio (unicidade de email/citizenId, etc.)
            org.AddRepresentative(rep);
            org.EnsureHasAtLeastOneRepresentative();

            await _orgRepo.UpdateAsync(org);

            return RepresentativeMapper.ToDTO(rep);
        }


        public async Task<RepresentativeDto> UpdateAsync(Guid repId, UpdateRepresentativeRequest req)
        {
            var rep = await _repRepo.GetByIdAsync(repId)
                      ?? throw new KeyNotFoundException("Representative not found.");

            var org = await _orgRepo.GetByIdAsync(rep.OrganizationId)
                      ?? throw new KeyNotFoundException("Organization not found.");

            org.UpdateRepresentative(
                repId,
                req.Name,
                req.CitizenId,
                req.Nationality,
                req.Email,
                req.Phone
            );

            await _orgRepo.UpdateAsync(org);

            var updated = await _repRepo.GetByIdAsync(repId);
            return RepresentativeMapper.ToDTO(updated!);
        }


        public async Task SetActiveAsync(Guid repId, bool isActive)
        {
            var rep = await _repRepo.GetByIdAsync(repId)
                      ?? throw new KeyNotFoundException("Representative not found.");

            var org = await _orgRepo.GetByIdAsync(rep.OrganizationId)
                      ?? throw new KeyNotFoundException("Organization not found.");

            if (isActive)
                org.ActivateRepresentative(repId);
            else
                org.DeactivateRepresentative(repId);

            await _orgRepo.UpdateAsync(org);
        }


        public async Task<IEnumerable<RepresentativeDto>> ListAsync(Guid orgId, bool? active)
        {
            var reps = await _repRepo.ListByOrganizationAsync(orgId, active);
            return reps.Select(RepresentativeMapper.ToDTO);
        }

        public async Task<IEnumerable<RepresentativeDto>> ListByOrganizationAsync(Guid orgId, bool? active)
        {
            var reps = await _repRepo.ListByOrganizationAsync(orgId, active);
            return reps.Select(RepresentativeMapper.ToDTO);
        }

        public async Task<IEnumerable<RepresentativeDto>> ListAllAsync(Guid? orgId, bool? active)
        {
            var reps = await _repRepo.ListAllAsync(orgId, active);
            return reps.Select(RepresentativeMapper.ToDTO);
        }
    }
}
