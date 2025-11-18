using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Agents;

namespace WebApp.Models.Application.Mappers
{
    public static class OrganizationMapper
    {
        public static OrganizationDto ToDTO(ShippingAgentOrganization org)
        {
            var dto = new OrganizationDto
            {
                Id = org.Id,
                LegalName = org.LegalName,
                AlternativeNames = org.AlternativeNames,
                Address = org.Address,
                TaxNumber = org.TaxNumber
            };

            if (org.Representatives != null && org.Representatives.Count > 0)
            {
                dto.Representatives = org.Representatives
                    .Select(RepresentativeMapper.ToDTO)
                    .ToList();
            }

            return dto;
        }
    }
}
