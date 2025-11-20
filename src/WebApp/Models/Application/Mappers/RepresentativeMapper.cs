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

            return new RepresentativeDto
            {
                Id = rep.Id,
                OrganizationId = rep.OrganizationId,
                Name = rep.Name,
                CitizenId = rep.CitizenId,
                Nationality = rep.Nationality,
                Email = rep.Email,
                Phone = rep.Phone,
                IsActive = rep.IsActive
            };
        }

        public static Representative ToDomain(Guid organizationId, CreateRepresentativeDto dto)
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

        public static void UpdateFromDto(Representative rep, UpdateRepresentativeDto dto)
        {
            if (rep == null || dto == null)
                throw new ArgumentNullException(rep == null ? nameof(rep) : nameof(dto));

            rep.UpdateProfile(
                nationality: dto.Nationality,
                email: dto.Email,
                phone: dto.Phone
            );
        }
    }
}