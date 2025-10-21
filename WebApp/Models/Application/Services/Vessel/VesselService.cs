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

        public async Task RegisterVesselAsync(string imo, string name, string operatorName, VesselType vesselType, int bays, int rows, int tiers, int requiredCraneCount, double requiredDockLength)
        {
            var vessel = new Vessel(imo, name, operatorName, vesselType, bays, rows, tiers, requiredCraneCount, requiredDockLength);
            await _vesselRepo.AddVesselAsync(vessel);
        }

        public async Task RegisterVesselDTOAsync(VesselDTO dto)
        {
            // Resolve vessel type by name
            var vesselType = await _vesselTypeService.GetVesselTypeByNameAsync(dto.VesselType);
            if (vesselType == null)
                throw new ArgumentException($"Vessel type '{dto.VesselType}' not recognized.");

            await RegisterVesselAsync(dto.IMO, dto.VesselName, dto.OperatorName, vesselType, dto.Bays, dto.Rows, dto.Tiers, dto.RequiredCraneCount, dto.RequiredDockLength);
        }

        public async Task UpdateVesselAsync(string imo, string name, string operatorName, VesselType vesselType, int bays, int rows, int tiers, int requiredCraneCount, double requiredDockLength)
        {
            var vessel = await _vesselRepo.GetByIMOAsync(imo);
            if (vessel == null)
                throw new ArgumentException("Vessel not found.", nameof(imo));

            vessel.VesselName = name;
            vessel.OperatorName = operatorName;
            vessel.VesselType = vesselType;
            vessel.UpdateBays(bays);
            vessel.UpdateRows(rows);
            vessel.UpdateTiers(tiers);
            vessel.RequiredCraneCount = requiredCraneCount;
            vessel.RequiredDockLength = requiredDockLength;

            await _vesselRepo.UpdateVesselAsync(vessel);
        }

        public Task<Vessel?> GetVesselByIMOAsync(string imo) => _vesselRepo.GetByIMOAsync(imo);
        public Task<List<Vessel>> GetVesselByNameAsync(string name) => _vesselRepo.GetByNameAsync(name);
        public Task<List<Vessel>> GetVesselsByOperatorAsync(string operatorName) => _vesselRepo.GetByOperatorAsync(operatorName);
        public Task<List<Vessel>> GetAllVesselsAsync() => _vesselRepo.GetAllAsync();
    }
}
