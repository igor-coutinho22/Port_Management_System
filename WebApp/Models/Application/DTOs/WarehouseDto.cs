namespace WebApp.Models.Application.DTOs
{
    public record WarehouseDto(
        string Name,
        int MaxCapacityTeu,
        int CurrentOccupancyTeu,
        string SpecializedCargoType
    );
}
