using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.VesselVisits;

namespace WebApp.Models.Application.Mappers
{
    public static class CrewMapper
    {
        public static CrewMemberDTO ToDTO(CrewMember entity)
        {
            return new CrewMemberDTO
            {
                Name = entity.Name,
                CitizenId = entity.CitizenId,
                Nationality = entity.Nationality
            };
        }

        public static CrewMember ToEntity(CrewMemberDTO dto)
        {
            return new CrewMember(
                dto.Name!,
                dto.CitizenId!,
                dto.Nationality!
            );
        }
    }
}