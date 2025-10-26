using WebApp.Models.Application.DTOs;
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

        public async Task<OrganizationDto> CreateAsync(CreateOrganizationRequest req)
        {
            if (req.Representatives == null || !req.Representatives.Any())
                throw new ArgumentException("At least one representative is required.");

            if (await _orgRepo.GetByTaxNumberAsync(req.TaxNumber) != null)
                throw new ArgumentException("Tax number already exists.");

            var org = new ShippingAgentOrganization(
                req.LegalName, req.AlternativeNames, req.Address, req.TaxNumber);

            foreach (var r in req.Representatives)
                org.AddRepresentative(new Representative(org.Id, r.Name, r.CitizenId, r.Nationality, r.Email, r.Phone));

            await _orgRepo.AddAsync(org);

            return new OrganizationDto(org.Id, org.LegalName, org.AlternativeNames, org.Address, org.TaxNumber);
        }

        public async Task<OrganizationDto> GetAsync(Guid id)
        {
            var org = await _orgRepo.GetByIdAsync(id) ?? throw new KeyNotFoundException("Organization not found.");
            return new OrganizationDto(org.Id, org.LegalName, org.AlternativeNames, org.Address, org.TaxNumber);
        }

        // listar com filtros opcionais
        public async Task<IEnumerable<OrganizationDto>> ListAsync(string? name, string? taxNumber)
        {
            var items = await _orgRepo.ListAsync(name, taxNumber);
            return items.Select(o => new OrganizationDto(o.Id, o.LegalName, o.AlternativeNames, o.Address, o.TaxNumber));
        }

        // update
        public async Task<OrganizationDto> UpdateAsync(Guid id, UpdateOrganizationRequest req)
        {
            var org = await _orgRepo.GetByIdAsync(id) ?? throw new KeyNotFoundException("Organization not found.");

            // se mudar o tax number, validar duplicado
            if (!string.Equals(org.TaxNumber, req.TaxNumber, StringComparison.OrdinalIgnoreCase))
            {
                var exists = await _orgRepo.GetByTaxNumberAsync(req.TaxNumber);
                if (exists != null && exists.Id != id)
                    throw new ArgumentException("Tax number already exists.");
            }

            org.UpdateProfile(req.LegalName, req.AlternativeNames, req.Address, req.TaxNumber);
            await _orgRepo.UpdateAsync(org);

            return new OrganizationDto(org.Id, org.LegalName, org.AlternativeNames, org.Address, org.TaxNumber);
        }
    }
}
