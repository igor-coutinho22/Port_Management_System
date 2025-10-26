namespace WebApp.Models.Application.DTOs
{
    public class WarehouseDto
    {
        public string? Name { get; set; }
        public int MaxCapacityTeu { get; set; }
        public int CurrentOccupancyTeu { get; set; }
        public string? SpecializedCargoType { get; set; }
    }
}
