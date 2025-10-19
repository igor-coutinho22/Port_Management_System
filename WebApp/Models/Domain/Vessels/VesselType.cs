using System;
using System.Collections.Generic;
using System.Linq;

namespace WebApp.Models.Domain.Vessels.VesselType
{
    public class VesselType
    {
        private static readonly List<VesselType> _allTypes = new();

        public string Name { get; set; }
        public string Description { get; set; }
        public int MaxBays { get; set; }
        public int MaxRows { get; set; }
        public int MaxTiers { get; set; }
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

        // Return all vessel types
        public static IEnumerable<VesselType> GetAllTypes() => _allTypes;
    }
}
