using System;
using System.Collections.Generic;
using System.Linq;
using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Infrastructure.Repositories.VesselTypeRepository
{
    public class VesselTypeRepository : IVesselTypeRepository
    {
        private readonly List<VesselType> _vesselTypes = VesselType.GetAllTypes().ToList();

        // ----------------------------
        // Get all vessel types
        // ----------------------------
        public List<VesselType> GetAll() => _vesselTypes;

        // ----------------------------
        // Exact match by name
        // ----------------------------
        public VesselType? GetByName(string name) =>
            _vesselTypes.FirstOrDefault(vt => vt.Name.Equals(name, StringComparison.OrdinalIgnoreCase));

        // ----------------------------
        // Partial match by name
        // ----------------------------
        public List<VesselType> SearchByName(string partialName) =>
            _vesselTypes
                .Where(vt => vt.Name.Contains(partialName, StringComparison.OrdinalIgnoreCase))
                .ToList();

        // ----------------------------
        // Partial match by description
        // ----------------------------
        public List<VesselType> SearchByDescription(string keyword) =>
            _vesselTypes.Where(vt => vt.Description.Contains(keyword, StringComparison.OrdinalIgnoreCase)).ToList();

        // ----------------------------
        // Add a new vessel type
        // ----------------------------
        public void Add(VesselType vesselType)
        {
            if (_vesselTypes.Any(vt => vt.Name.Equals(vesselType.Name, StringComparison.OrdinalIgnoreCase)))
                throw new InvalidOperationException($"A vessel type with the name '{vesselType.Name}' already exists.");

            _vesselTypes.Add(vesselType);
        }

        // ----------------------------
        // Update an existing vessel type
        // ----------------------------
        public void Update(string currentName, VesselType updatedVesselType)
        {
            var existing = GetByName(currentName);
            if (existing == null)
                throw new KeyNotFoundException($"Vessel type '{currentName}' not found.");

            // Prevent renaming to an already existing name
            if (!currentName.Equals(updatedVesselType.Name, StringComparison.OrdinalIgnoreCase) &&
                _vesselTypes.Any(vt => vt.Name.Equals(updatedVesselType.Name, StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException($"A vessel type with the name '{updatedVesselType.Name}' already exists.");
            }

            // Update properties
            existing.Name = updatedVesselType.Name;
            existing.Description = updatedVesselType.Description;
            existing.MaxBays = updatedVesselType.MaxBays;
            existing.MaxRows = updatedVesselType.MaxRows;
            existing.MaxTiers = updatedVesselType.MaxTiers;
        }
    }
}
