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
                StorageArea = StorageAreaMapper.MapToDto(containerYard),
                DockIds = containerYard.DocksServed.Select(dc => dc.Id).ToList()
            };
        }

        public static ContainerYard MapToDomain(ContainerYardDto dto, ICollection<Dock> docks)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            return new ContainerYard
            (
                name: dto.StorageArea!.Name!,
                maxCapacityTeu: dto.StorageArea!.MaxCapacityTeu,
                docksServed: docks
            );
        }

        public static ContainerYard MapToDomainForUpdate(int id, ContainerYardDto dto, ICollection<Dock> docks)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            return ContainerYard.CreateForUpdate(
                id: id,
                name: dto.StorageArea!.Name!,
                maxCapacityTeu: dto.StorageArea!.MaxCapacityTeu,
                docksServed: docks
            );
        }
    }
}