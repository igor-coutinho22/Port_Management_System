using WebApp.Models.Domain.Docks;
using WebApp.Models.Domain.Vessels;

namespace WebApp.Models.Application.DTOs
{
    public class DockMapper
    {
        // Converts a domain Dock entity to a DTO.
        public static DockDto MapToDto(Dock dock)
        {
            if (dock == null)
                throw new ArgumentNullException(nameof(dock));

            return new DockDto
            {
                Id = dock.Id,
                Name = dock.Name,
                Location = dock.Location,
                LengthMeters = dock.LengthMeters,
                DepthMeters = dock.DepthMeters,
                MaxDraftMeters = dock.MaxDraftMeters,
                AllowedVesselTypes = dock.AllowedVesselTypes.Select(vt => vt.Name).ToList()
            };
        }

        // Converts a DockDto back to the domain Dock entity.
        public static Dock MapToDomain(DockDto dto, List<VesselType> allowedVesselTypes)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            return new Dock(
                name: dto.Name,
                location: dto.Location,
                length: dto.LengthMeters,
                depth: dto.DepthMeters,
                maxDraft: dto.MaxDraftMeters,
                allowedVesselTypes: allowedVesselTypes
            );
        }

        // Helper method to update an existing dock with DTO data
        public static void UpdateFromDto(Dock existingDock, DockDto dto, List<VesselType> allowedVesselTypes)
        {
            if (existingDock == null)
                throw new ArgumentNullException(nameof(existingDock));
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            existingDock.Update(
                name: dto.Name,
                location: dto.Location,
                length: dto.LengthMeters,
                depth: dto.DepthMeters,
                maxDraft: dto.MaxDraftMeters,
                allowedVesselTypes: allowedVesselTypes
            );
        }
        }
}