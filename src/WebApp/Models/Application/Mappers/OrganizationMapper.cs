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

            return new OrganizationDto
            {
                Id = org.Id,
                Identifier = org.Identifier,
                LegalName = org.LegalName,
                AlternativeNames = org.AlternativeNames,
                Address = org.Address,
                TaxNumber = org.TaxNumber,
                IsActive = org.IsActive,
                Representatives = org.Representatives.Select(RepresentativeMapper.ToDto).ToList()
            };
        }

        public static ShippingAgentOrganization ToDomain(CreateOrganizationDto dto)
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

        public static void UpdateFromDto(ShippingAgentOrganization org, UpdateOrganizationDto dto)
        {
            if (org == null || dto == null)
                throw new ArgumentNullException(org == null ? nameof(org) : nameof(dto));

            org.UpdateProfile(
                alternativeNames: dto.AlternativeNames, 
                address: dto.Address);
        }
    }
}