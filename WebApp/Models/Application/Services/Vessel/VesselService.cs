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
            if (!Vessel.IsValidIMO(imo))
                throw new ArgumentException("Invalid IMO number.");

            if (bays > vesselType.MaxBays || rows > vesselType.MaxRows || tiers > vesselType.MaxTiers)
                throw new ArgumentException("Dimensions exceed the vessel type limits.");

            var vessel = new Vessel(imo, name, operatorName, vesselType, bays, rows, tiers, requiredCraneCount, requiredDockLength);

            await _vesselRepo.AddVesselAsync(vessel);
        }

        public Task<Vessel?> GetVesselByIMOAsync(string imo) => _vesselRepo.GetByIMOAsync(imo);
        public Task<List<Vessel>> GetVesselByNameAsync(string name) => _vesselRepo.GetByNameAsync(name);
        public Task<List<Vessel>> GetVesselsByOperatorAsync(string operatorName) => _vesselRepo.GetByOperatorAsync(operatorName);
        public Task<List<Vessel>> GetAllVesselsAsync() => _vesselRepo.GetAllAsync();
    }
}
