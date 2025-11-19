// File: WebApp/Models/Application/Mappers/RepresentativeMapper.cs
using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Agents;

namespace WebApp.Models.Application.Mappers
{
    public static class RepresentativeMapper
    {
        public static RepresentativeDto ToDto(Representative rep)
        {
            if (rep == null)
                throw new ArgumentNullException(nameof(rep));

            return new RepresentativeDto(
                rep.Id,
                rep.OrganizationId,
                rep.Name,
                rep.CitizenId,
                rep.Nationality,
                rep.Email,
                rep.Phone,
                rep.IsActive
            );
        }

        public static Representative ToDomain(Guid organizationId, CreateRepresentativeRequest dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            return new Representative(
                organizationId,
                dto.Name,
                dto.CitizenId,
                dto.Nationality,
                dto.Email,
                dto.Phone
            );
        }

        public static void UpdateDomain(Representative rep, UpdateRepresentativeRequest dto)
        {
            if (rep == null || dto == null)
                throw new ArgumentNullException(rep == null ? nameof(rep) : nameof(dto));

            rep.UpdateProfile(dto.Name, dto.CitizenId, dto.Nationality, dto.Email, dto.Phone);
            
            if (dto.IsActive)
                rep.SetActive(true);
            else
                rep.SetActive(false);
        }
    }
}