using Microsoft.EntityFrameworkCore;
using Oem.Models.Context;
using Oem.Models.Domain.OperationPlans;
using Oem.Models.Domain.OperationPlans.Enums;

namespace Oem.Models.Infrastructure.Repositories
{
    public class OperationPlanRepository : IOperationPlanRepository
    {
        private readonly OemContext _context;

        public OperationPlanRepository(OemContext context)
        {
            _context = context;
        }

        public async Task<OperationPlan?> GetByIdAsync(Guid id)
        {
            return await _context.OperationPlans
                .Include(p => p.Items)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<OperationPlan>> GetAllAsync()
        {
            return await _context.OperationPlans
                .Include(p => p.Items)
                .ToListAsync();
        }

        public async Task AddAsync(OperationPlan plan)
        {
            await _context.OperationPlans.AddAsync(plan);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            var newAudits = _context.ChangeTracker.Entries<OperationPlanAudit>()
                .Where(e => e.State == EntityState.Modified || e.State == EntityState.Detached)
                .ToList();

            foreach (var entry in newAudits)
            {
                entry.State = EntityState.Added;
            }
            
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(OperationPlan plan)
        {
            _context.OperationPlans.Update(plan);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(OperationPlan plan)
        {
            _context.OperationPlans.Remove(plan);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<OperationPlan?>> SearchPlansAsync(DateOnly? startDate, DateOnly? endDate, string? vesselIMO)
        {
            var query = _context.OperationPlans
                .Include(p => p.Items)
                .AsQueryable();

            if (startDate.HasValue && !endDate.HasValue)
            {
                query = query.Where(p => p.ScheduleDate == startDate.Value);
            }
            else if (startDate.HasValue && endDate.HasValue)
            {
                query = query.Where(p => p.ScheduleDate >= startDate.Value && p.ScheduleDate <= endDate.Value);
            }
            else if (!startDate.HasValue && endDate.HasValue)
            {
                query = query.Where(p => p.ScheduleDate == endDate.Value);
            }

            if (!string.IsNullOrEmpty(vesselIMO))
            {
                // Plans that have at least one item with this VesselIMO
                query = query.Where(p => p.Items.Any(i => i.VesselIMO.Contains(vesselIMO)));
            }

            return await query.ToListAsync();
        }
    }
}