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

        /// <summary>
        /// Creates a Warehouse for updates without generating a new ID.
        /// Use this method when you need a Warehouse object for existing entities.
        /// </summary>
        public static Warehouse CreateForUpdate(int id, string name, int maxCapacityTeu, int currentOccupancyTeu, string specializedCargoType)
        {
            var warehouse = new Warehouse
            {
                Name = name,
                MaxCapacityTeu = maxCapacityTeu,
                CurrentOccupancyTeu = currentOccupancyTeu,
                SpecializedCargoType = specializedCargoType
            };
            
            // Set the ID directly to avoid generating a new one
            warehouse.Id = id;
            return warehouse;
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