// File: WebApp/Models/Application/Mappers/OrganizationMapper.cs
using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Agents;

namespace WebApp.Models.Application.Mappers
{
    public static class OrganizationMapper
    {
        public static OrganizationDto ToDto(ShippingAgentOrganization org)
        {
            if (org == null)
                throw new ArgumentNullException(nameof(org));

            return new OrganizationDto(
                org.Id,
                org.Identifier,
                org.LegalName,
                org.AlternativeNames,
                org.Address,
                org.TaxNumber,
                org.IsActive
            );
        }

        public static ShippingAgentOrganization ToDomain(CreateOrganizationRequest dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            return new ShippingAgentOrganization(
                identifier: dto.Identifier,
                legalName: dto.LegalName,
                alternativeNames: dto.AlternativeName,
                address: dto.Address,
                taxNumber: dto.TaxNumber
            );
        }

        public static void UpdateDomain(ShippingAgentOrganization org, UpdateOrganizationRequest dto)
        {
            if (org == null || dto == null)
                throw new ArgumentNullException(org == null ? nameof(org) : nameof(dto));

            org.UpdateProfile(dto.LegalName, dto.AlternativeName, dto.Address, dto.TaxNumber);
            
            if (dto.IsActive)
                org.Activate();
            else
                org.Deactivate();
        }
    }
}