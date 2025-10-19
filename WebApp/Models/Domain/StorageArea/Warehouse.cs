using PortManagement.Domain.Enums;

namespace WebApp.Models.Domain.StorageArea
{
    public class Warehouse : StorageArea
    {
        // Supports planning/assignment (e.g., 'refrigerated fruit destined for Warehouse A')
        public string? SpecializedCargoType { get; protected set; }

        protected Warehouse()
        {
            Type = StorageAreaType.Warehouse;
        }

        public Warehouse(string name, int maxCapacityTeu, int currentOccupancyTeu, string specializedCargoType)
            : base(StorageAreaType.Warehouse, name, maxCapacityTeu, currentOccupancyTeu)
        {
            if (string.IsNullOrWhiteSpace(specializedCargoType))
                throw new ArgumentException("Specialized cargo type cannot be empty.", nameof(specializedCargoType));

            SpecializedCargoType = specializedCargoType;
        }

        public override string GetUsageDescription()
        {
            return $"Warehouse for cargo requiring additional handling/inspection ({SpecializedCargoType}).";
        }
        
        public void UpdateCargoType(string newCargoType)
        {
            if (string.IsNullOrWhiteSpace(newCargoType))
                throw new ArgumentException("Specialized cargo type cannot be empty.", nameof(newCargoType));

            SpecializedCargoType = newCargoType;
        }
    }
}