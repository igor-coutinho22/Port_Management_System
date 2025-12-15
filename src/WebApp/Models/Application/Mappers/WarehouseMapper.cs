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
                StorageArea = StorageAreaMapper.MapToDto(warehouse),
                SpecializedCargoType = warehouse.SpecializedCargoType
            };
        }

        public static Warehouse MapToDomain(WarehouseDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            return new Warehouse
            (
                name: dto.StorageArea!.Name!,
                maxCapacityTeu: dto.StorageArea!.MaxCapacityTeu,
                specializedCargoType: dto.SpecializedCargoType!
            );
        }

        public static Warehouse MapToDomainForUpdate(int id, WarehouseDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            return Warehouse.CreateForUpdate(
                id: id,
                name: dto.StorageArea!.Name!,
                maxCapacityTeu: dto.StorageArea!.MaxCapacityTeu,
                specializedCargoType: dto.SpecializedCargoType!
            );
        }
    }
}