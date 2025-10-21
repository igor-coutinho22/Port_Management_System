using WebApp.Models.Domain.Vessel;
using WebApp.Models.Infrastructure.Repositories;
using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Application.Services.VesselService
{
    public class VesselService : IVesselService
    {
        private readonly IVesselRepository _vesselRepo;

        public VesselService(IVesselRepository vesselRepo)
        {
            _vesselRepo = vesselRepo;
        }

        public async Task RegisterVesselAsync(string imo, string name, string operatorName, VesselType vesselType, int bays, int rows, int tiers, int requiredCraneCount, double requiredDockLength)
        {
            var vessel = new Vessel(imo, name, operatorName, vesselType, bays, rows, tiers, requiredCraneCount, requiredDockLength);
            await _vesselRepo.AddVesselAsync(vessel);
        }

        public async Task UpdateVesselAsync(string imo, string name, string operatorName, VesselType vesselType, int bays, int rows, int tiers, int requiredCraneCount, double requiredDockLength)
        {
            var vessel = await _vesselRepo.GetByIMOAsync(imo);
            if (vessel == null)
                throw new ArgumentException("Vessel not found.", nameof(imo));
                
            await _vesselRepo.UpdateVesselAsync(vessel, name, operatorName, vesselType, bays, rows, tiers, requiredCraneCount, requiredDockLength);
        }

        public Task<Vessel?> GetVesselByIMOAsync(string imo) => _vesselRepo.GetByIMOAsync(imo);
        public Task<List<Vessel>> GetVesselByNameAsync(string name) => _vesselRepo.GetByNameAsync(name);
        public Task<List<Vessel>> GetVesselsByOperatorAsync(string operatorName) => _vesselRepo.GetByOperatorAsync(operatorName);
        public Task<List<Vessel>> GetAllVesselsAsync() => _vesselRepo.GetAllAsync();
    }
}
