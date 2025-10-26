using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Vessel;
using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Application.Mappers
{
    public static class VesselMapper
    {
        // Converts a domain Vessel entity to a DTO.
        public static VesselDTO MapToDto(Vessel vessel)
        {
            if (vessel == null)
                throw new ArgumentNullException(nameof(vessel));

            return new VesselDTO
            {
                IMO = vessel.IMO,
                VesselName = vessel.VesselName,
                OperatorName = vessel.OperatorName,
                Bays = vessel.Bays,
                RequiredDockLength = vessel.RequiredDockLength,
                RequiredCraneCount = vessel.RequiredCraneCount,
                Rows = vessel.Rows,
                Tiers = vessel.Tiers
            };
        }

        // Converts a VesselDTO back to the domain Vessel entity.
        // Note: This method requires VesselType to be resolved separately by the service layer
        public static Vessel MapToDomain(VesselDTO dto, VesselType vesselType)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));
            if (vesselType == null)
                throw new ArgumentNullException(nameof(vesselType));

            return new Vessel(
                imo: dto.IMO!,
                vesselName: dto.VesselName!,
                operatorName: dto.OperatorName!,
                vesselType: vesselType, // Use resolved VesselType object
                bays: dto.Bays,
                rows: dto.Rows,
                tiers: dto.Tiers,
                requiredCraneCount: dto.RequiredCraneCount,
                requiredDockLength: dto.RequiredDockLength
            );
        }
    }
}