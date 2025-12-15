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

        public async Task<OperationPlan?> GetByDateAsync(DateOnly date)
        {
            // Load the Plan AND its Items
            return await _context.OperationPlans
                .Include(p => p.Items)
                .FirstOrDefaultAsync(p => p.ScheduleDate == date && p.Status != OperationPlanStatus.Rejected);
        }

        public async Task<OperationPlan?> GetByIdAsync(Guid id)
        {
            return await _context.OperationPlans
                .Include(p => p.Items)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task AddAsync(OperationPlan plan)
        {
            await _context.OperationPlans.AddAsync(plan);
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
    }
}