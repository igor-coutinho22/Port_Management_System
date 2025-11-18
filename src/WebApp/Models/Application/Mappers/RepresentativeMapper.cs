using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Agents;

namespace WebApp.Models.Application.Mappers
{
    public static class RepresentativeMapper
    {
        public static RepresentativeDto ToDTO(Representative rep)
        {
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
    }
}
