using WebApp.Models.Domain.Vessel;
using WebApp.Models.Infrastructure.Repositories;
using WebApp.Models.Domain.Vessels.VesselType;
using WebApp.Models.Application.DTOs;
using WebApp.Models.Application.Services.VesselTypeService;

namespace WebApp.Models.Application.Services.VesselService
{
    public class VesselService : IVesselService
    {
        private readonly IVesselRepository _vesselRepo;
        private readonly IVesselTypeService _vesselTypeService;

        public VesselService(IVesselRepository vesselRepo, IVesselTypeService vesselTypeService)
        {
            _vesselRepo = vesselRepo;
            _vesselTypeService = vesselTypeService;
        }

        public async Task RegisterVesselAsync(Vessel vessel)
        {
            if (vessel == null)
                throw new ArgumentNullException(nameof(vessel));
            
            var existingVessel = await _vesselRepo.GetByIMOAsync(vessel.IMO);
            if (existingVessel != null)
                throw new ArgumentException($"A vessel with IMO '{vessel.IMO}' already exists.", nameof(vessel.IMO));
            
            await _vesselRepo.AddVesselAsync(vessel);
        }

        public async Task UpdateVesselAsync(Vessel vessel)
        {
            if (vessel == null)
                throw new ArgumentNullException(nameof(vessel));

            var existingVessel = await GetVesselByIMOAsync(vessel.IMO);
            if (existingVessel == null)
                throw new ArgumentException("Vessel not found.", nameof(vessel.IMO));

            if (existingVessel.IMO != vessel.IMO)
                throw new ArgumentException("Changing vessel IMO is not allowed.", nameof(vessel.IMO));
            existingVessel.VesselName = vessel.VesselName;
            existingVessel.OperatorName = vessel.OperatorName;
            existingVessel.VesselType = vessel.VesselType;
            existingVessel.UpdateBays(vessel.Bays);
            existingVessel.UpdateRows(vessel.Rows);
            existingVessel.UpdateTiers(vessel.Tiers);
            existingVessel.RequiredCraneCount = vessel.RequiredCraneCount;
            existingVessel.RequiredDockLength = vessel.RequiredDockLength;

            await _vesselRepo.UpdateVesselAsync(existingVessel);
        }

        public Task<Vessel?> GetVesselByIMOAsync(string imo) => _vesselRepo.GetByIMOAsync(imo);
        public Task<List<Vessel>> GetVesselByNameAsync(string name) => _vesselRepo.GetByNameAsync(name);
        public Task<List<Vessel>> GetVesselsByOperatorAsync(string operatorName) => _vesselRepo.GetByOperatorAsync(operatorName);
        public Task<List<Vessel>> GetAllVesselsAsync() => _vesselRepo.GetAllAsync();
        public async Task DeleteVesselAsync(string imo)
        {
            var vesselToDelete = await GetVesselByIMOAsync(imo);
            if (vesselToDelete == null)
                throw new ArgumentException($"Vessel with IMO '{imo}' not found.");

            await _vesselRepo.DeleteVesselAsync(vesselToDelete);
        }
    }
}
