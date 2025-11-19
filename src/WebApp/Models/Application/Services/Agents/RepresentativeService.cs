// File: WebApp/Models/Application/Services/RepresentativeService.cs
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Mappers;
using WebApp.Models.Domain.Agents;
using WebApp.Models.Infrastructure.Repositories;

namespace WebApp.Models.Application.Services
{
    public class RepresentativeService : IRepresentativeService
    {
        private readonly IOrganizationRepository _orgRepo;
        private readonly IRepresentativeRepository _repRepo;

        public RepresentativeService(IOrganizationRepository orgRepo, IRepresentativeRepository repRepo)
        {
            _orgRepo = orgRepo;
            _repRepo = repRepo;
        }

        public async Task<RepresentativeDto> CreateAsync(Guid orgId, CreateRepresentativeRequest req)
        {
            // Check if organization exists
            var org = await _orgRepo.GetByIdAsync(orgId);
            if (org == null)
                throw new KeyNotFoundException("Organization not found.");

            // Convert DTO to Domain
            var rep = RepresentativeMapper.ToDomain(orgId, req);
            
            // Add to organization (this will validate uniqueness)
            org.AddRepresentative(rep);
            
            await _repRepo.AddAsync(rep);
            await _orgRepo.UpdateAsync(org); // Update organization to reflect the new representative

            return RepresentativeMapper.ToDto(rep);
        }

        public async Task<RepresentativeDto> UpdateAsync(Guid repId, UpdateRepresentativeRequest req)
        {
            var rep = await _repRepo.GetByIdAsync(repId);
            if (rep == null)
                throw new KeyNotFoundException("Representative not found.");

            RepresentativeMapper.UpdateDomain(rep, req);
            await _repRepo.UpdateAsync(rep);

            return RepresentativeMapper.ToDto(rep);
        }

        public async Task<IEnumerable<RepresentativeDto>> GetByOrganizationAsync(Guid orgId)
        {
            var reps = await _repRepo.GetByOrganizationAsync(orgId);
            return reps.Select(RepresentativeMapper.ToDto);
        }

        public async Task<IEnumerable<RepresentativeDto>> GetAllAsync(Guid? orgId = null, bool? active = null)
        {
            var reps = await _repRepo.GetAllAsync(orgId, active);
            return reps.Select(RepresentativeMapper.ToDto);
        }

        public async Task DeleteAsync(Guid repId)
        {
            var rep = await _repRepo.GetByIdAsync(repId);
            if (rep == null)
                throw new KeyNotFoundException("Representative not found.");

            // Get organization to check business rules
            var org = await _orgRepo.GetByIdAsync(rep.OrganizationId);
            if (org != null)
            {
                org.RemoveRepresentative(repId);
                await _orgRepo.UpdateAsync(org);
            }

            await _repRepo.DeleteAsync(rep);
        }
    }
}