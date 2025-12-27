using Microsoft.EntityFrameworkCore;
using Oem.Models.Context;
using Oem.Models.Domain.VesselVisitExecutions;

namespace Oem.Models.Infrastructure.Repositories
{
    public class VesselVisitExecutionRepository : IVesselVisitExecutionRepository
    {
        private readonly OemContext _context;

        public VesselVisitExecutionRepository(OemContext context)
        {
            _context = context;
        }

        public async Task AddAsync(VesselVisitExecution vesselVisitExecution)
        {
            await _context.VesselVisitExecutions.AddAsync(vesselVisitExecution);
            await _context.SaveChangesAsync();
        }

        public async Task<VesselVisitExecution?> GetByIdAsync(Guid id)
        {
            return await _context.VesselVisitExecutions
                .FirstOrDefaultAsync(v => v.Id == id);
        }

        public async Task<IEnumerable<VesselVisitExecution>> GetAllAsync()
        {
            return await _context.VesselVisitExecutions
                .ToListAsync();
        }

        public async Task DeleteAsync(VesselVisitExecution vesselVisitExecution)
        {
            _context.VesselVisitExecutions.Remove(vesselVisitExecution);
            await _context.SaveChangesAsync();

        }
    }
}