using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.Staff;

namespace WebApp.Models.Infrastructure.Repositories
{
    public class StaffRepository : IStaffRepository
    {
        private readonly PortManagementContext _context;

        public StaffRepository(PortManagementContext context)
        {
            _context = context;
        }

        public async Task<Staff?> GetByIdAsync(Guid id)
            => await _context.Staff
                .Include(s => s.Qualifications)
                .FirstOrDefaultAsync(s => s.Id == id);

        public async Task<IEnumerable<Staff>> SearchAsync(string? name, string? status, string? qualificationCode)
        {
            var query = _context.Staff
                .Include(s => s.Qualifications)
                .AsQueryable();

            if (!string.IsNullOrEmpty(name))
                query = query.Where(s => s.ShortName.Contains(name));

            if (!string.IsNullOrEmpty(status))
                query = query.Where(s => s.Status.ToString() == status);

            return await query.ToListAsync();
        }

        public async Task AddAsync(Staff staff)
        {
            await _context.Staff.AddAsync(staff);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Staff staff)
        {
            _context.Staff.Update(staff);
            await _context.SaveChangesAsync();
        }
    }
}
