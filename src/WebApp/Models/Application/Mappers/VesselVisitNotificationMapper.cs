using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.VesselVisits;

namespace WebApp.Models.Application.Mappers
{
    public static class VesselVisitNotificationMapper
    {
        public static VesselVisitNotificationDTO ToDTO(VesselVisitNotification entity)
        {
            return new VesselVisitNotificationDTO
            {
                Id = entity.Id,
                VesselId = entity.VesselIMO,
                DockId = entity.DockId,
                VisitDate = entity.VisitDate,
                Status = entity.Status.ToString(),
                Purpose = entity.Purpose.ToString(),
                LoadingManifest = entity.LoadingManifest != null
                    ? new CargoManifestDTO
                    {
                        Id = entity.LoadingManifest.Id,
                        Type = entity.LoadingManifest.Type.ToString()
                    }
                    : null,
                UnloadingManifest = entity.UnloadingManifest != null
                    ? new CargoManifestDTO
                    {
                        Id = entity.UnloadingManifest.Id,
                        Type = entity.UnloadingManifest.Type.ToString()
                    }
                    : null,
                Crew = entity.Crew.Select(c => new CrewMemberDTO
                {
                    Name = c.Name,
                    CitizenId = c.CitizenId,
                    Nationality = c.Nationality
                }).ToList()
            };
        }

        public static VesselVisitNotification ToEntity(VesselVisitNotificationDTO dto)
        {
            var entity = new VesselVisitNotification(
                dto.VesselId,
                dto.DockId,
                dto.VisitDate,
                Enum.Parse<VisitPurpose>(dto.Purpose, ignoreCase: true)
            );

            // Optional: add manifests if present
            if (dto.LoadingManifest != null)
            {
                var manifest = new CargoManifest(CargoManifestType.Loading);
                entity.AddLoadingManifest(manifest);
            }

            if (dto.UnloadingManifest != null)
            {
                var manifest = new CargoManifest(CargoManifestType.Unloading);
                entity.AddUnloadingManifest(manifest);
            }

            // Add crew
            foreach (var member in dto.Crew)
                entity.AddCrewMember(member.Name, member.CitizenId, member.Nationality);

            return entity;
        }
    }
}
