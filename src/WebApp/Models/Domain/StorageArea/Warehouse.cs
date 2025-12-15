using PortManagement.Domain.Enums;

namespace WebApp.Models.Domain.StorageArea
{
    public class Warehouse : StorageArea
    {
        public string? SpecializedCargoType { get; protected set; }

        protected Warehouse()
        {
            Type = StorageAreaType.Warehouse;
        }

        public Warehouse(string name, int maxCapacityTeu, string specializedCargoType)
            : base(StorageAreaType.Warehouse, name, maxCapacityTeu)
        {
            if (string.IsNullOrWhiteSpace(specializedCargoType))
                throw new ArgumentException("Specialized cargo type cannot be empty.", nameof(specializedCargoType));

            SpecializedCargoType = specializedCargoType;
        }

        /// <summary>
        /// Creates a Warehouse for updates without generating a new ID.
        /// Prefer updating tracked entities instead of creating new instances.
        /// </summary>
        public static Warehouse CreateForUpdate(int id, string name, int maxCapacityTeu, string specializedCargoType)
        {
            if (id <= 0) throw new ArgumentOutOfRangeException(nameof(id));
            if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name cannot be empty.", nameof(name));
            if (maxCapacityTeu < 0) throw new ArgumentOutOfRangeException(nameof(maxCapacityTeu));
            if (string.IsNullOrWhiteSpace(specializedCargoType))
                throw new ArgumentException("Specialized cargo type cannot be empty.", nameof(specializedCargoType));

            var warehouse = new Warehouse
            {
                Name = name,
                MaxCapacityTeu = maxCapacityTeu,
                SpecializedCargoType = specializedCargoType
            };

            warehouse.Id = id;
            return warehouse;
        }

        public override string GetUsageDescription()
            => $"Warehouse for cargo requiring additional handling/inspection ({SpecializedCargoType}).";

        public void UpdateCargoType(string newCargoType)
        {
            if (string.IsNullOrWhiteSpace(newCargoType))
                throw new ArgumentException("Specialized cargo type cannot be empty.", nameof(newCargoType));

            SpecializedCargoType = newCargoType;
        }
    }
}
