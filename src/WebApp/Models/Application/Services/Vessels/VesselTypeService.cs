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

        public async Task AddVesselTypeAsync(VesselType vesselType)
        {
            if (vesselType == null)
                throw new ArgumentNullException(nameof(vesselType));
            
            var existingVesselType = await _vesselTypeRepo.GetVesselTypeByNameAsync(vesselType.Name);
            if (existingVesselType != null)
                throw new ArgumentException($"A vessel type with name '{vesselType.Name}' already exists.", nameof(vesselType.Name));
            
            await _vesselTypeRepo.AddVesselTypeAsync(vesselType);
        }

        public async Task UpdateVesselTypeAsync(VesselType vesselType)
        {
            if (vesselType == null)
                throw new ArgumentNullException(nameof(vesselType));

            var existingVesselType = await GetVesselTypeByNameAsync(vesselType.Name);
            if (existingVesselType == null)
                throw new ArgumentException("Vessel type not found.", nameof(vesselType.Name));

            if (existingVesselType.Name != vesselType.Name)
                throw new ArgumentException("Changing vessel type name is not allowed.", nameof(vesselType.Name));
            existingVesselType.Description = vesselType.Description;
            existingVesselType.UpdateMaxBays(vesselType.MaxBays);
            existingVesselType.UpdateMaxRows(vesselType.MaxRows);
            existingVesselType.UpdateMaxTiers(vesselType.MaxTiers);

            await _vesselTypeRepo.UpdateVesselTypeAsync(existingVesselType);
        }

        public async Task DeleteVesselTypeAsync(string name)
        {
            var vesselTypeToDelete = await GetVesselTypeByNameAsync(name);
            if (vesselTypeToDelete == null)
                throw new ArgumentException($"Vessel type '{name}' not found.");

            await _vesselTypeRepo.DeleteVesselTypeAsync(vesselTypeToDelete);
        }
    }
}
