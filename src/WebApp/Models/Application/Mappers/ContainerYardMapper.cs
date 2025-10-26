using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.Docks;
using WebApp.Models.Domain.StorageArea;

namespace WebApp.Models.Application.Mappers
{
    public class ContainerYardMapper
    {
        public static ContainerYardDto MapToDto(ContainerYard containerYard)
        {
            if (containerYard == null)
                throw new ArgumentNullException(nameof(containerYard));

            return new ContainerYardDto
            {
                Id = containerYard.Id,
                Name = containerYard.Name,
                Type = containerYard.Type,
                MaxCapacityTeu = containerYard.MaxCapacityTeu,
                CurrentOccupancyTeu = containerYard.CurrentOccupancyTeu,
                DockIds = containerYard.DockConnections.Select(dc => dc.DockId).ToList()
            };
        }

        public static ContainerYard MapToDomain(ContainerYardDto dto, ICollection<Dock> docks)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            return new ContainerYard
            (
                name: dto.Name!,
                maxCapacityTeu: dto.MaxCapacityTeu,
                currentOccupancyTeu: dto.CurrentOccupancyTeu,
                docksServed: docks
            );
        }

        public static ContainerYard MapToDomainForUpdate(int id, ContainerYardDto dto, ICollection<Dock> docks)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            return ContainerYard.CreateForUpdate(
                id: id,
                name: dto.Name!,
                maxCapacityTeu: dto.MaxCapacityTeu,
                currentOccupancyTeu: dto.CurrentOccupancyTeu,
                docksServed: docks
            );
        }
    }
}