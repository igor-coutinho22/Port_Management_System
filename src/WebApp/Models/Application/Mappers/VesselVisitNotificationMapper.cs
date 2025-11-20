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
                VesselIMO = entity.VesselIMO,
                DockId = entity.DockId,
                VisitDate = entity.VisitDate,
                Status = entity.Status.ToString(),
                Purpose = entity.Purpose.ToString(),
                LoadingManifest = entity.LoadingManifest != null
                    ? new CargoManifestDTO
                    {
                        Id = entity.LoadingManifest.Id,
                        Type = entity.LoadingManifest.Type.ToString(),
                        Containers = entity.LoadingManifest.Containers.Select(c => new ContainerDTO { Identifier = c.Identifier }).ToList()
                    }
                    : null,
                UnloadingManifest = entity.UnloadingManifest != null
                    ? new CargoManifestDTO
                    {
                        Id = entity.UnloadingManifest.Id,
                        Type = entity.UnloadingManifest.Type.ToString(),
                        Containers = entity.UnloadingManifest.Containers.Select(c => new ContainerDTO { Identifier = c.Identifier }).ToList()
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
                dto.VesselIMO!,
                dto.DockId,
                dto.VisitDate,
                Enum.Parse<VisitPurpose>(dto.Purpose, ignoreCase: true)
            );

            // Optional: add manifests if present
            if (dto.LoadingManifest != null)
            {
                var manifest = new CargoManifest(CargoManifestType.Loading);
                if (dto.LoadingManifest.Containers != null)
                {
                    foreach (var containerDto in dto.LoadingManifest.Containers)
                    {
                        manifest.AddContainer(new Container(containerDto.Identifier));
                    }
                }
                entity.AddLoadingManifest(manifest);
            }

            if (dto.UnloadingManifest != null)
            {
                var manifest = new CargoManifest(CargoManifestType.Unloading);
                if (dto.UnloadingManifest.Containers != null)
                {
                    foreach (var containerDto in dto.UnloadingManifest.Containers)
                    {
                        manifest.AddContainer(new Container(containerDto.Identifier));
                    }
                }
                entity.AddUnloadingManifest(manifest);
            }
            foreach (var member in dto.Crew)
                entity.AddCrewMember(member.Name, member.CitizenId, member.Nationality);

            return entity;
        }

        public static void UpdateFromDto(VesselVisitNotification entity, VesselVisitNotificationUpdateDTO dto)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

           CargoManifest? loadingManifest = null;
            if (dto.LoadingManifest != null)
            {
                loadingManifest = new CargoManifest(CargoManifestType.Loading);
                if (dto.LoadingManifest.Containers != null)
                {
                    var containers = dto.LoadingManifest.Containers
                        .Select(c => new Container(c.Identifier))
                        .ToList();
                    loadingManifest.UpdateContainers(containers); // Use your method here
                }
            }

            CargoManifest? unloadingManifest = null;
            if (dto.UnloadingManifest != null)
            {
                unloadingManifest = new CargoManifest(CargoManifestType.Unloading);
                if (dto.UnloadingManifest.Containers != null)
                {
                    var containers = dto.UnloadingManifest.Containers
                        .Select(c => new Container(c.Identifier))
                        .ToList();
                    unloadingManifest.UpdateContainers(containers); // Use your method here
                }
            }

            entity.Update(
                dockId: dto.DockId,
                visitDate: dto.VisitDate,
                purpose: Enum.Parse<VisitPurpose>(dto.Purpose, ignoreCase: true),
                loadingManifest: loadingManifest,
                unloadingManifest: unloadingManifest,
                crew: dto.Crew.Select(c => new CrewMember(c.Name, c.CitizenId, c.Nationality))
            );
        }

        public static VesselVisitNotificationFilterDTO ToFilterDTO(
            string? vesselIMO, 
            string? status, 
            DateTime? fromDate, 
            DateTime? toDate)
        {
            return new VesselVisitNotificationFilterDTO
            {
                VesselIMO = vesselIMO,
                Status = status,
                FromDate = fromDate,
                ToDate = toDate,
            };
        }
    }
}
