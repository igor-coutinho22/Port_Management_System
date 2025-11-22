using WebApp.Models.Domain.Agents;
using WebApp.Models.Infrastructure.Repositories;

namespace WebApp.Models.Application.Services
{
    public class OrganizationService : IOrganizationService
    {
        private readonly IOrganizationRepository _orgRepo;

        public OrganizationService(IOrganizationRepository orgRepo)
        {
            _orgRepo = orgRepo;
        }

        public async Task CreateAsync(ShippingAgentOrganization org, List<Representative> representatives)
        {
            if (org == null)
                throw new ArgumentNullException(nameof(org));
            
            // Add representatives if any
            foreach (var repReq in representatives)
            {
                org.AddRepresentative(repReq);
            }

            // Ensure at least one representative (business rule from US 2.2.5)
            org.EnsureHasAtLeastOneRepresentative();

            await _orgRepo.AddAsync(org);
        }

        public async Task UpdateAsync(Guid id, ShippingAgentOrganization org)
        {
            if (org == null)
                throw new ArgumentNullException("Organization not found.");

            var existingOrg = await _orgRepo.GetByIdAsync(id);
            if (existingOrg == null)
                throw new ArgumentException("Organization not found.");

            existingOrg.UpdateAlternativeNames(org.AlternativeNames);
            existingOrg.UpdateAddress(org.Address);

            await _orgRepo.UpdateAsync(existingOrg);
        }

        public async Task<ShippingAgentOrganization?> GetByIdAsync(Guid id)
        {
            return await _orgRepo.GetByIdAsync(id);
        }

        public async Task<List<ShippingAgentOrganization>> GetAllAsync()
        {
            return await _orgRepo.GetAllAsync();
        }

        public async Task<List<ShippingAgentOrganization>> SearchAsync(string? name, string? taxNumber)
        {
            return await _orgRepo.SearchAsync(name, taxNumber);
        }

        public async Task ActivateAsync(Guid id)
        {
            var org = await _orgRepo.GetByIdAsync(id);
            if (org == null)
                throw new KeyNotFoundException("Organization not found.");

            org.Activate();
            await _orgRepo.UpdateAsync(org);
        }

        public async Task DeactivateAsync(Guid id)
        {
            var org = await _orgRepo.GetByIdAsync(id);
            if (org == null)
                throw new KeyNotFoundException("Organization not found.");

            org.Deactivate();
            await _orgRepo.UpdateAsync(org);
        }

        public async Task AddRepresentativeAsync(Guid id, Representative rep)
        {
            var org = await _orgRepo.GetByIdAsync(id);
            if (org == null)
                throw new KeyNotFoundException("Organization not found.");

            org.AddRepresentative(rep);
            await _orgRepo.AddOrRemoveRepresentativeAsync();
        }

        public async Task RemoveRepresentativeAsync(Guid organizationId, Guid repId)
        {
            var org = await _orgRepo.GetByIdAsync(organizationId);
            if (org == null)
                throw new KeyNotFoundException("Organization not found.");

            org.RemoveRepresentative(repId);
            await _orgRepo.UpdateAsync(org);
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