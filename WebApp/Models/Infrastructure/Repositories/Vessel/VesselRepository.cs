using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.Vessel;
using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Infrastructure.Repositories.VesselRepository
{
    public class VesselRepository : IVesselRepository
    {
        private readonly PortManagementContext _context;

        public VesselRepository(PortManagementContext context)
        {
            _context = context;
        }

        public async Task AddVesselAsync(Vessel vessel)
        {
            var exists = await _context.Vessels.AnyAsync(v => v.IMO == vessel.IMO);
            if (exists)
                throw new ArgumentException("A vessel with this IMO number already exists.");

            await _context.Vessels.AddAsync(vessel);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateVesselAsync(Vessel vessel, string name, string operatorName, VesselType vesselType, int bays, int rows, int tiers, int requiredCraneCount, double requiredDockLength)
        {
            vessel.VesselName = name;
            vessel.OperatorName = operatorName;
            vessel.VesselType = vesselType;
            vessel.UpdateBays(bays);
            vessel.UpdateRows(rows);
            vessel.UpdateTiers(tiers);
            vessel.RequiredCraneCount = requiredCraneCount;
            vessel.RequiredDockLength = requiredDockLength;

            await _context.SaveChangesAsync();
        }

        public async Task<Vessel?> GetByIMOAsync(string imo) =>
            await _context.Vessels.FirstOrDefaultAsync(v => v.IMO == imo);

        public async Task<List<Vessel>> GetByNameAsync(string name) =>
            await _context.Vessels
                .Where(v => v.VesselName.Contains(name))
                .ToListAsync();

        public async Task<List<Vessel>> GetByOperatorAsync(string operatorName) =>
            await _context.Vessels
                .Where(v => v.OperatorName == operatorName)
                .ToListAsync();

        public async Task<List<Vessel>> GetAllAsync() => await _context.Vessels.ToListAsync();
    }
}
