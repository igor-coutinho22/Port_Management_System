using System;
using System.Collections.Generic;
using WebApp.Models.Domain.Vessels.VesselType;
using WebApp.Models.Infrastructure.Repositories.VesselTypeRepository;

namespace WebApp.Models.Application.Services.VesselTypeService
{
    public class VesselTypeService : IVesselTypeService
    {
        private readonly VesselTypeRepository _vesselTypeRepo;

        public VesselTypeService(VesselTypeRepository vesselTypeRepo)
        {
            _vesselTypeRepo = vesselTypeRepo;
        }

        // ----------------------------
        // Get all vessel types
        // ----------------------------
        public List<VesselType> GetAllVesselTypes() => _vesselTypeRepo.GetAll();

        // ----------------------------
        // Get a vessel type by exact name
        // ----------------------------
        public VesselType? GetVesselTypeByName(string name) => _vesselTypeRepo.GetByName(name);

        // ----------------------------
        // Search vessel types by name or description keyword
        // ----------------------------
        public List<VesselType> SearchVesselTypesByName(string partialName) => _vesselTypeRepo.SearchByName(partialName);

        public List<VesselType> SearchVesselTypesByDescription(string keyword) => _vesselTypeRepo.SearchByDescription(keyword);

        // ----------------------------
        // Add a new vessel type
        // ----------------------------
        public void AddVesselType(string name, string description, int maxBays, int maxRows, int maxTiers)
        {
            var vesselType = new VesselType(name, description, maxBays, maxRows, maxTiers);
            _vesselTypeRepo.Add(vesselType);
        }

        // ----------------------------
        // Update an existing vessel type
        // ----------------------------
        public void UpdateVesselType(string currentName, string newName, string description, int maxBays, int maxRows, int maxTiers)
        {
            var updatedVesselType = new VesselType(newName, description, maxBays, maxRows, maxTiers);
            _vesselTypeRepo.Update(currentName, updatedVesselType);
        }
    }
}
