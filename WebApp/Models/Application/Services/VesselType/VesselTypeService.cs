using System;
using System.Collections.Generic;
using Microsoft.Graph.SecurityNamespace;
using WebApp.Models.Domain.Vessels.VesselType;
using WebApp.Models.Infrastructure.Repositories;

namespace WebApp.Models.Application.Services.VesselTypeService
{
    public class VesselTypeService : IVesselTypeService
    {
        private readonly IVesselTypeRepository _vesselTypeRepo;

        public VesselTypeService(IVesselTypeRepository vesselTypeRepo)
        {
            _vesselTypeRepo = vesselTypeRepo;
        }

        public Task<List<VesselType>> GetAllVesselTypesAsync() => _vesselTypeRepo.GetAllVesselTypesAsync();

        public Task<VesselType?> GetVesselTypeByNameAsync(string name) => _vesselTypeRepo.GetVesselTypeByNameAsync(name);

        public Task<List<VesselType>> SearchVesselTypesByNameAsync(string partialName) => _vesselTypeRepo.SearchVesselTypeByNameAsync(partialName);

        public Task<List<VesselType>> SearchVesselTypesByDescriptionAsync(string keyword) => _vesselTypeRepo.SearchVesselTypeByDescriptionAsync(keyword);

        public async Task AddVesselTypeAsync(string name, string description, int maxBays, int maxRows, int maxTiers)
        {
            var vesselType = new VesselType(name, description, maxBays, maxRows, maxTiers);
            await _vesselTypeRepo.AddVesselTypeAsync(vesselType);
        }

        public async Task UpdateVesselTypeAsync(string currentName, string newName, string description, int maxBays, int maxRows, int maxTiers)
        {
            var vesselTypeToUpdate = await GetVesselTypeByNameAsync(currentName);
            if (vesselTypeToUpdate == null)
                throw new ArgumentException($"Vessel type '{currentName}' not found.");

            vesselTypeToUpdate.Name = newName;
            vesselTypeToUpdate.Description = description;
            vesselTypeToUpdate.UpdateMaxBays(maxBays);
            vesselTypeToUpdate.UpdateMaxRows(maxRows);
            vesselTypeToUpdate.UpdateMaxTiers(maxTiers);

            await _vesselTypeRepo.UpdateVesselTypeAsync(vesselTypeToUpdate);
        }
    }
}
