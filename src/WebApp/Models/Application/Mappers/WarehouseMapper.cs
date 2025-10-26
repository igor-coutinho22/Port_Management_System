using WebApp.Models.Application.DTOs;
using WebApp.Models.Domain.StorageArea;

namespace WebApp.Models.Application.Mappers
{
    public class WarehouseMapper
    {
        // Converts a domain Warehouse entity to a DTO.
        public static WarehouseDto MapToDto(Warehouse warehouse)
        {
            if (warehouse == null)
                throw new ArgumentNullException(nameof(warehouse));

            return new WarehouseDto
            {
                Id = warehouse.Id,
                Name = warehouse.Name,
                Type = warehouse.Type,
                MaxCapacityTeu = warehouse.MaxCapacityTeu,
                CurrentOccupancyTeu = warehouse.CurrentOccupancyTeu,
                SpecializedCargoType = warehouse.SpecializedCargoType
            };
        }

        public static Warehouse MapToDomain(WarehouseDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            return new Warehouse
            (
                name: dto.Name!,
                maxCapacityTeu: dto.MaxCapacityTeu,
                currentOccupancyTeu: dto.CurrentOccupancyTeu,
                specializedCargoType: dto.SpecializedCargoType!
            );
        }

        public static Warehouse MapToDomainForUpdate(int id, WarehouseDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            return Warehouse.CreateForUpdate(
                id: id,
                name: dto.Name!,
                maxCapacityTeu: dto.MaxCapacityTeu,
                currentOccupancyTeu: dto.CurrentOccupancyTeu,
                specializedCargoType: dto.SpecializedCargoType!
            );
        }
    }
}