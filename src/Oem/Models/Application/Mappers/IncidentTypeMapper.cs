using Oem.Models.Application.DTOs;
using Oem.Models.Domain.Incidents;

namespace Oem.Models.Application.Mappers
{
    public static class IncidentTypeMapper
    {
        public static IncidentType ToDomain(CreateIncidentTypeDTO dto)
        {
            return new IncidentType(dto.Code, dto.Name, dto.Description, dto.Severity, dto.ParentTypeId);
        }

        public static IncidentTypeDTO ToDTO(IncidentType entity)
        {
            return new IncidentTypeDTO
            {
                Id = entity.Id,
                Code = entity.Code,
                Name = entity.Name,
                Description = entity.Description,
                Severity = entity.Severity,
                ParentTypeId = entity.ParentTypeId
            };
        }
    }
}
