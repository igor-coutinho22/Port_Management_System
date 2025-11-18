using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.Staff;
using WebApp.Models.Domain.Staff.Interfaces;
namespace WebApp.Models.Infrastructure.Repositories.StaffRepository
{
    public class StaffRepository : IStaffRepository
    {
        private readonly PortManagementContext _context;

        public StaffRepository(PortManagementContext context)
        {
            _context = context;
        }

         public async Task AddAsync(Staff staff)
        {
            await _context.Staff.AddAsync(staff);
            await _context.SaveChangesAsync();
        }

        public async Task<Staff?> GetByMecanographicNumberAsync(string mecanographicNumber)
            => await _context.Staff
                .Include(s => s.QualificationLinks)
                    .ThenInclude(link => link.Qualification)
                .FirstOrDefaultAsync(s => s.MecanographicNumber == mecanographicNumber);

        public async Task<List<Staff>> GetAllAsync()
            => await _context.Staff
                .Include(s => s.QualificationLinks)
                    .ThenInclude(link => link.Qualification)
                .ToListAsync();

        public async Task<List<Staff>> GetByStatusAsync(StaffStatus status)
            => await _context.Staff
                .Include(s => s.QualificationLinks)
                    .ThenInclude(link => link.Qualification)
                .Where(s => s.Status == status)
                .ToListAsync();

        public async Task<List<Staff>> SearchAsync(string? name, StaffStatus? status, string? qualificationCode)
        {
            var query = _context.Staff
                .Include(s => s.QualificationLinks)
                    .ThenInclude(link => link.Qualification)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
                query = query.Where(s => s.ShortName.Contains(name));

            if (status.HasValue)
                query = query.Where(s => s.Status == status.Value);

            if (!string.IsNullOrWhiteSpace(qualificationCode))
                query = query.Where(s => s.QualificationLinks.Any(link => link.QualificationCode == qualificationCode));

            return await query.ToListAsync();
        }

        public async Task UpdateAsync(Staff staff)
        {
            _context.Staff.Update(staff);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(string mecanographicNumber)
        {
            var staff = await _context.Staff.FirstOrDefaultAsync(s => s.MecanographicNumber == mecanographicNumber);
            if (staff == null)
                throw new KeyNotFoundException($"Staff '{mecanographicNumber}' not found.");

            _context.Staff.Remove(staff);
            await _context.SaveChangesAsync();
        }
    }
}
