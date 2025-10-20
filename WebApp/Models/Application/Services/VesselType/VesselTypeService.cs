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

        public Task<List<VesselType>> GetAllVesselTypesAsync() => _vesselTypeRepo.GetAllAsync();

        public Task<VesselType?> GetVesselTypeByNameAsync(string name) => _vesselTypeRepo.GetByNameAsync(name);

        public Task<List<VesselType>> SearchVesselTypesByNameAsync(string partialName) => _vesselTypeRepo.SearchByNameAsync(partialName);

        public Task<List<VesselType>> SearchVesselTypesByDescriptionAsync(string keyword) => _vesselTypeRepo.SearchByDescriptionAsync(keyword);

        public async Task AddVesselTypeAsync(string name, string description, int maxBays, int maxRows, int maxTiers)
        {
            var vesselType = new VesselType(name, description, maxBays, maxRows, maxTiers);
            await _vesselTypeRepo.AddAsync(vesselType);
        }

        public async Task UpdateVesselTypeAsync(string currentName, string newName, string description, int maxBays, int maxRows, int maxTiers)
        {
            var updatedVesselType = new VesselType(newName, description, maxBays, maxRows, maxTiers);
            await _vesselTypeRepo.UpdateAsync(currentName, updatedVesselType);
        }
    }
}
