using PortManagement.Domain.Enums;

namespace WebApp.Models.Application.DTOs
{
    public class StorageAreaDTO
    {
        public string? Name { get; set; }
        public StorageAreaType? Type { get; set; }
        public int MaxCapacityTeu { get; set; }
        public int CurrentOccupancyTeu { get; set; }
    }
}