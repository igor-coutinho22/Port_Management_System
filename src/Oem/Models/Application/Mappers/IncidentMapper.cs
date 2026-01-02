using Oem.Models.Application.DTOs;
using Oem.Models.Domain.Incidents;

namespace Oem.Models.Application.Mappers
{
    public static class IncidentMapper
    {
        public static Incident ToDomain(CreateIncidentDTO dto)
        {
            return new Incident(
                dto.IncidentTypeId, 
                dto.Description, 
                dto.StartTime, 
                dto.Severity, 
                dto.Author, 
                dto.Scope, 
                dto.AffectedVesselVisitIds
            );
        }

        public static IncidentDTO ToDTO(Incident entity)
        {
            return new IncidentDTO
            {
                Id = entity.Id,
                IncidentTypeId = entity.IncidentTypeId,
                Description = entity.Description,
                StartTime = entity.StartTime,
                EndTime = entity.EndTime,
                Status = entity.Status.ToString(),
                Severity = entity.Severity,
                CreatedBy = entity.CreatedBy,
                Scope = entity.Scope.ToString(),
                AffectedVesselVisitIds = entity.AffectedVesselVisitIds ?? new List<Guid>()
            };
        }
    }
}
