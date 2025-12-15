using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.VesselVisits;
using WebApp.Models.Domain.Containers;

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
                ShippingAgentOrganizationId = entity.ShippingAgentOrganizationId,
                DockId = entity.DockId,
                VisitDate = entity.VisitDate,
                Status = entity.Status.ToString(),
                Purpose = entity.Purpose.ToString(),

                LoadingManifest = entity.LoadingManifest != null
                    ? new CargoManifestDTO
                    {
                        Id = entity.LoadingManifest.Id,
                        Type = entity.LoadingManifest.Type.ToString(),
                        Containers = entity.LoadingManifest.Containers.Select(c => new ContainerDTO
                        {
                            Identifier = c.Identifier,
                            Teu = c.Teu
                        }).ToList()
                    }
                    : null,

                UnloadingManifest = entity.UnloadingManifest != null
                    ? new CargoManifestDTO
                    {
                        Id = entity.UnloadingManifest.Id,
                        Type = entity.UnloadingManifest.Type.ToString(),
                        Containers = entity.UnloadingManifest.Containers.Select(c => new ContainerDTO
                        {
                            Identifier = c.Identifier,
                            Teu = c.Teu
                        }).ToList()
                    }
                    : null,

                Crew = entity.Crew.Select(c => new CrewMemberDTO
                {
                    Name = c.Name,
                    CitizenId = c.CitizenId,
                    Nationality = c.Nationality
                }).ToList(),

                ArrivalTime = entity.ArrivalTime,
                DesiredDepartureTime = entity.DesiredDepartureTime,
                EstimatedLoadingDurationMinutes = entity.EstimatedLoadingDurationMinutes,
                EstimatedUnloadingDurationMinutes = entity.EstimatedUnloadingDurationMinutes
            };
        }

        public static VesselVisitNotification ToEntity(VesselVisitNotificationDTO dto)
        {
            var entity = new VesselVisitNotification(
                dto.ShippingAgentOrganizationId,
                dto.VesselIMO!,
                dto.DockId,
                dto.VisitDate,
                Enum.Parse<VisitPurpose>(dto.Purpose, ignoreCase: true),
                dto.ArrivalTime,
                dto.DesiredDepartureTime,
                dto.EstimatedLoadingDurationMinutes,
                dto.EstimatedUnloadingDurationMinutes
            );

            if (dto.LoadingManifest != null)
            {
                var manifest = new CargoManifest(CargoManifestType.Loading);

                if (dto.LoadingManifest.Containers != null)
                {
                    foreach (var containerDto in dto.LoadingManifest.Containers)
                    {
                        manifest.AddContainer(new Container(containerDto.Identifier, containerDto.Teu));
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
                        manifest.AddContainer(new Container(containerDto.Identifier, containerDto.Teu));
                    }
                }

                entity.AddUnloadingManifest(manifest);
            }

            foreach (var member in dto.Crew)
                entity.AddCrewMember(CrewMapper.ToEntity(member));

            return entity;
        }

        public static void UpdateFromDto(VesselVisitNotification entity, VesselVisitNotificationUpdateDTO dto)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            // Update manifests and containers in-place to avoid breaking EF tracking
            entity.Update(
                dockId: dto.DockId,
                visitDate: dto.VisitDate,
                purpose: Enum.Parse<VisitPurpose>(dto.Purpose, ignoreCase: true),
                arrivalTime: dto.ArrivalTime,
                desiredDepartureTime: dto.DesiredDepartureTime,
                estimatedLoadingDurationMinutes: dto.EstimatedLoadingDurationMinutes,
                estimatedUnloadingDurationMinutes: dto.EstimatedUnloadingDurationMinutes
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