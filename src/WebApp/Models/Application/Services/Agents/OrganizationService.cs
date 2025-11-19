// File: WebApp/Models/Application/Services/OrganizationService.cs
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Mappers;
using WebApp.Models.Domain.Agents;
using WebApp.Models.Infrastructure.Repositories;

namespace WebApp.Models.Application.Services
{
    public class OrganizationService : IOrganizationService
    {
        private readonly IOrganizationRepository _orgRepo;
        private readonly IRepresentativeRepository _repRepo;

        public OrganizationService(IOrganizationRepository orgRepo, IRepresentativeRepository repRepo)
        {
            _orgRepo = orgRepo;
            _repRepo = repRepo;
        }

        public async Task<OrganizationDto> CreateAsync(CreateOrganizationRequest req)
        {
            // Convert DTO to Domain
            var org = OrganizationMapper.ToDomain(req);

            // Add representatives if any
            foreach (var repReq in req.Representatives)
            {
                var rep = RepresentativeMapper.ToDomain(org.Id, repReq);
                org.AddRepresentative(rep);
            }

            // Ensure at least one representative (business rule from US 2.2.5)
            org.EnsureHasAtLeastOneRepresentative();

            await _orgRepo.AddAsync(org);
            return OrganizationMapper.ToDto(org);
        }

        public async Task<OrganizationDto> UpdateAsync(Guid id, UpdateOrganizationRequest req)
        {
            var org = await _orgRepo.GetByIdAsync(id);
            if (org == null)
                throw new KeyNotFoundException("Organization not found.");

            OrganizationMapper.UpdateDomain(org, req);
            await _orgRepo.UpdateAsync(org);

            return OrganizationMapper.ToDto(org);
        }

        public async Task<OrganizationDto?> GetByIdAsync(Guid id)
        {
            var org = await _orgRepo.GetByIdAsync(id);
            return org == null ? null : OrganizationMapper.ToDto(org);
        }

        public async Task<IEnumerable<OrganizationDto>> GetAllAsync()
        {
            var orgs = await _orgRepo.GetAllAsync();
            return orgs.Select(OrganizationMapper.ToDto);
        }

        public async Task<IEnumerable<OrganizationDto>> SearchAsync(string? name, string? taxNumber)
        {
            var orgs = await _orgRepo.SearchAsync(name, taxNumber);
            return orgs.Select(OrganizationMapper.ToDto);
        }

        public async Task DeleteAsync(Guid id)
        {
            var org = await _orgRepo.GetByIdAsync(id);
            if (org == null)
                throw new KeyNotFoundException("Organization not found.");

            await _orgRepo.DeleteAsync(org);
        }
    }
}