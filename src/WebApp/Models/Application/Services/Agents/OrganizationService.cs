using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Mappers;
using WebApp.Models.Domain.Agents;
using WebApp.Models.Infrastructure.Repositories;

namespace WebApp.Models.Application.Services
{
    public class OrganizationService : IOrganizationService
    {
        private readonly OrganizationRepository _orgRepo;

        public OrganizationService(OrganizationRepository orgRepo)
        {
            _orgRepo = orgRepo;
        }

        public async Task<OrganizationDto> CreateAsync(CreateOrganizationRequest req)
        {
            if (req.Representatives == null || !req.Representatives.Any())
                throw new ArgumentException("At least one representative is required.");

            // ----- VALIDAÇÕES DE UNICIDADE (Usando o repositorio) -----

            if (await _orgRepo.ExistsWithLegalNameAsync(req.LegalName))
                throw new ArgumentException("An organization with the same legal name already exists.");

            if (!string.IsNullOrWhiteSpace(req.AlternativeNames)
                && await _orgRepo.ExistsWithAlternativeNamesAsync(req.AlternativeNames))
                throw new ArgumentException("An organization with the same alternative names already exists.");

            if (await _orgRepo.ExistsWithTaxNumberAsync(req.TaxNumber))
                throw new ArgumentException("An organization with the same tax number already exists.");

            // ----- CRIAR DOMÍNIO (Validações do domínio são aplicadas aqui) -----
            var org = new ShippingAgentOrganization(
                req.LegalName,
                req.AlternativeNames,
                req.Address,
                req.TaxNumber);

            // Representatives enviados vêm do DTO → mapear para domínio
            foreach (var r in req.Representatives)
            {
                var rep = new Representative(
                    org.Id,
                    r.Name,
                    r.CitizenId,
                    r.Nationality,
                    r.Email,
                    r.Phone
                );

                org.AddRepresentative(rep);
            }

            // Garantir que tem pelo menos 1 representante ativo
            org.EnsureHasAtLeastOneRepresentative();

            await _orgRepo.AddAsync(org);

            return OrganizationMapper.ToDTO(org);
        }

        public async Task<OrganizationDto> UpdateAsync(Guid id, UpdateOrganizationRequest req)
        {
            var org = await _orgRepo.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Organization not found.");

            // ----- Validar duplicados (ignorar esta própria organização) -----

            if (!string.Equals(org.LegalName, req.LegalName, StringComparison.OrdinalIgnoreCase) &&
                await _orgRepo.ExistsWithLegalNameAsync(req.LegalName))
                throw new ArgumentException("Another organization already uses this legal name.");

            if (!string.IsNullOrWhiteSpace(req.AlternativeNames) &&
                !string.Equals(org.AlternativeNames, req.AlternativeNames, StringComparison.OrdinalIgnoreCase) &&
                await _orgRepo.ExistsWithAlternativeNamesAsync(req.AlternativeNames))
                throw new ArgumentException("Another organization already uses these alternative names.");

            if (!string.Equals(org.TaxNumber, req.TaxNumber, StringComparison.OrdinalIgnoreCase) &&
                await _orgRepo.ExistsWithTaxNumberAsync(req.TaxNumber))
                throw new ArgumentException("Another organization already uses this tax number.");

            // ----- Atualizar (domínio volta a validar tudo) -----
            org.UpdateProfile(
                req.LegalName,
                req.AlternativeNames,
                req.Address,
                req.TaxNumber
            );

            await _orgRepo.UpdateAsync(org);

            return OrganizationMapper.ToDTO(org);
        }

        public async Task<OrganizationDto> GetAsync(Guid id)
        {
            var org = await _orgRepo.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Organization not found.");

            return OrganizationMapper.ToDTO(org);
        }

        public async Task<IEnumerable<OrganizationDto>> ListAsync(string? name, string? taxNumber)
        {
            var list = await _orgRepo.ListAsync(name, taxNumber);
            return list.Select(OrganizationMapper.ToDTO);
        }

        public async Task DeleteAsync(Guid id)
        {
            var org = await _orgRepo.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Organization not found.");

            await _orgRepo.DeleteAsync(org);
        }
    }
}
