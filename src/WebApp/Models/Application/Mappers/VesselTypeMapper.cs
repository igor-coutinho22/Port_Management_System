namespace WebApp.Models.Application.Mappers
{
    using WebApp.Models.Domain.Vessels;
    using WebApp.Models.Application.DTOs;
    using WebApp.Models.Domain.Vessels.VesselType;

    public static class VesselTypeMapper
    {
        // Converts a domain Vessel entity to a DTO.
        public static VesselTypeDTO MapToDto(VesselType vesselType)
        {
            if (vesselType == null)
                throw new ArgumentNullException(nameof(vesselType));

            return new VesselTypeDTO
            {
                Name = vesselType.Name,
                Description = vesselType.Description,
                MaxBays = vesselType.MaxBays,
                MaxRows = vesselType.MaxRows,
                MaxTiers = vesselType.MaxTiers
            };
        }

        // Converts a VesselDTO back to the domain Vessel entity (for creation)
        public static VesselType MapToDomain(VesselTypeDTO dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            return new VesselType(
                name: dto.Name!,
                description: dto.Description!,
                maxBays: dto.MaxBays,
                maxRows: dto.MaxRows,
                maxTiers: dto.MaxTiers
            );
        }

        // Converts a VesselDTO back to the domain Vessel entity (for updates)
        public static VesselType MapToDomainForUpdate(VesselTypeDTO dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            return VesselType.CreateForUpdate(
                name: dto.Name!,
                description: dto.Description!,
                maxBays: dto.MaxBays,
                maxRows: dto.MaxRows,
                maxTiers: dto.MaxTiers
            );
        }
    }
}