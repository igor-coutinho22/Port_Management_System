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

        public async Task CreateAsync(Guid orgId, Representative rep)
        {
            // Check if organization exists
            var org = await _orgRepo.GetByIdAsync(orgId);
            if (org == null)
                throw new KeyNotFoundException("Organization not found.");
            
            // Add to organization (this will validate uniqueness)
            org.AddRepresentative(rep);
            
            await _repRepo.AddAsync(rep);
            await _orgRepo.UpdateAsync(org); // Update organization to reflect the new representative
        }

        public async Task UpdateAsync(Guid repId, Representative rep)
        {
            if (rep == null)
                throw new ArgumentNullException("Representative cannot be null.");

            var existing = await _repRepo.GetByIdAsync(repId);
            if (existing == null)
                throw new ArgumentException("Representative not found.");

            existing.UpdateEmail(rep.Email);
            existing.UpdatePhone(rep.Phone);
            existing.UpdateNationality(rep.Nationality);
            
            await _repRepo.UpdateAsync(existing);
        }

        public async Task<List<Representative>> GetByOrganizationIdAsync(Guid orgId)
        {
            return await _repRepo.GetByOrganizationIdAsync(orgId);
        }

        public async Task<Representative?> GetByIdAsync(Guid repId)
        {
            return await _repRepo.GetByIdAsync(repId);
        }

        public async Task<List<Representative>> GetAllAsync()
        {
            return await _repRepo.GetAllAsync();
        }

        public async Task ActivateAsync(Guid repId)
        {
            var rep = await _repRepo.GetByIdAsync(repId);
            if (rep == null)
                throw new KeyNotFoundException("Representative not found.");

            rep.Activate();
            await _repRepo.UpdateAsync(rep);
        }

        public async Task DeactivateAsync(Guid repId)
        {
            var rep = await _repRepo.GetByIdAsync(repId);
            if (rep == null)
                throw new KeyNotFoundException("Representative not found.");

            rep.Deactivate();
            await _repRepo.UpdateAsync(rep);
        }
    }
}