namespace WebApp.Models.Application.DTOs
{
    public record StorageAreaDTO(
        string Name,
        string Type,
        int MaxCapacityTeu,
        int CurrentOccupancyTeu
    );
}