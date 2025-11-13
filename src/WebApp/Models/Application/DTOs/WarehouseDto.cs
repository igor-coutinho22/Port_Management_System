using PortManagement.Domain.Enums;

namespace WebApp.Models.Application.DTOs
{
    public class WarehouseDto
    {
        public StorageAreaDTO? StorageArea { get; set; }
        public string? SpecializedCargoType { get; set; }
    }
}
