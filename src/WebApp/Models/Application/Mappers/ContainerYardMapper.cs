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
                Name = containerYard.Name,
                MaxCapacityTeu = containerYard.MaxCapacityTeu,
                CurrentOccupancyTeu = containerYard.CurrentOccupancyTeu,
                DockIds = containerYard.DocksServed.Select(d => d.Id).ToList()
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
    }
}