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

        public async Task UpdateVesselAsync(Vessel vessel)
        {
            _context.Vessels.Update(vessel);
            await _context.SaveChangesAsync();
        }

        public async Task<Vessel?> GetByIMOAsync(string imo)
        {
            var vessel = await _context.Vessels
                .Include(v => v.VesselType)
                .FirstOrDefaultAsync(v => v.IMO == imo);

            // CargoGrid is not persisted (NotMapped), keep it null here so callers decide initialization if needed.

            return vessel;
        }

        public async Task<List<Vessel>> GetByNameAsync(string name)
        {
            var list = await _context.Vessels
                .Include(v => v.VesselType)
                .Where(v => v.VesselName.Contains(name))
                .ToListAsync();

            // CargoGrid is not persisted (NotMapped), keep it null here so callers decide initialization if needed.

            return list;
        }

        public async Task<List<Vessel>> GetByOperatorAsync(string operatorName)
        {
            var list = await _context.Vessels
                .Include(v => v.VesselType)
                .Where(v => v.OperatorName == operatorName)
                .ToListAsync();

            // CargoGrid is not persisted (NotMapped), keep it null here so callers decide initialization if needed.

            return list;
        }

        public async Task<List<Vessel>> GetAllAsync()
        {
            var list = await _context.Vessels
                .Include(v => v.VesselType)
                .ToListAsync();

            // CargoGrid is not persisted (NotMapped), keep it null here so callers decide initialization if needed.

            return list;
        }
    }
}
