using Oem.Models.Application.DTOs;
using Oem.Models.Domain.VesselVisitExecutions;

namespace Oem.Models.Application.Mappers
{
    public static class VesselVisitExecutionMapper
    {
        public static VesselVisitExecutionDTO ToDTO(VesselVisitExecution entity)
        {
            return new VesselVisitExecutionDTO
            {
                Id = entity.Id,
                VesselVisitId = entity.VesselVisitId,
                VesselIMO = entity.VesselIMO,
                ActualArrivalTime = entity.ActualArrivalTime,
                CreatedBy = entity.CreatedBy,
                CreatedAt = entity.CreatedAt,
                Status = entity.Status
            };
        }

        public static VesselVisitExecution ToDomain(this CreateVesselVisitExecutionDTO dto)
        {
            return new VesselVisitExecution
            (
                 dto.VesselVisitId,
                 dto.VesselIMO,
                 dto.ActualArrivalTime,
                 dto.CreatedBy
            );
        }
    }
}