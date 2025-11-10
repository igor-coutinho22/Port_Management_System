using System;
using System.Collections.Generic;
using System.Linq;

namespace WebApp.Models.Domain.Vessels
{
    public class VesselType
    {
        private static readonly List<VesselType> _allTypes = new();

        public string Name { get; set; } =  null!;
        public string Description { get; set; } = null!;
        public int MaxBays { get; protected set; }
        public int MaxRows { get; protected set; }
        public int MaxTiers { get; protected set; }
        public int MaxTEUCapacity => MaxRows * MaxBays * MaxTiers;

        public VesselType(string name, string description, int maxBays, int maxRows, int maxTiers)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Vessel type name cannot be empty.", nameof(name));

            // Check if the name already exists
            if (_allTypes.Any(vt => vt.Name.Equals(name, StringComparison.OrdinalIgnoreCase)))
                throw new InvalidOperationException($"A vessel type with the name '{name}' already exists.");

            Name = name;
            Description = description;
            MaxBays = maxBays;
            MaxRows = maxRows;
            MaxTiers = maxTiers;

            // Add to the static list
            _allTypes.Add(this);
        }

        protected VesselType()
        {
            // For ORM or serialization purposes
        }

        /// Creates a VesselType for updates without adding to static registry.
        /// Use this method when you need a VesselType object for existing entities.
        public static VesselType CreateForUpdate(string name, string description, int maxBays, int maxRows, int maxTiers)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Vessel type name cannot be empty.", nameof(name));

            return new VesselType
            {
                Name = name,
                Description = description,
                MaxBays = maxBays,
                MaxRows = maxRows,
                MaxTiers = maxTiers
            };
        }

        // Return all vessel types
        public static IEnumerable<VesselType> GetAllTypes() => _allTypes;

        public void UpdateMaxBays(int newMaxBays)
        {
            if (newMaxBays <= 0)
                throw new ArgumentException("Max bays must be greater than zero.", nameof(newMaxBays));

            MaxBays = newMaxBays;
        }

        public void UpdateMaxRows(int newMaxRows)
        {
            if (newMaxRows <= 0)
                throw new ArgumentException("Max rows must be greater than zero.", nameof(newMaxRows));

            MaxRows = newMaxRows;
        }

        public void UpdateMaxTiers(int newMaxTiers)
        {
            if (newMaxTiers <= 0)
                throw new ArgumentException("Max tiers must be greater than zero.", nameof(newMaxTiers));

            MaxTiers = newMaxTiers;
        }

        public override string ToString()
        {
            return $"{Name} - {Description} (Max Bays: {MaxBays}, Max Rows: {MaxRows}, Max Tiers: {MaxTiers}, Max TEU Capacity: {MaxTEUCapacity})";
        }
    }
}
