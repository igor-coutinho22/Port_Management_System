using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.Qualifications;

namespace WebApp.Models.Infrastructure.Repositories
{
    public class QualificationRepository : IQualificationRepository
    {
        private readonly PortManagementContext _context;

        public QualificationRepository(PortManagementContext context)
        {
            _context = context;
        }

        public async Task<Qualification?> GetByIdAsync(Guid id)
            => await _context.Qualifications.FirstOrDefaultAsync(q => q.Id == id);

        public async Task<Qualification?> GetByCodeAsync(string code)
            => await _context.Qualifications.FirstOrDefaultAsync(q => q.Code == code);

        public async Task<IEnumerable<Qualification>> SearchAsync(string? code, string? name)
        {
            var query = _context.Qualifications.AsQueryable();

            if (!string.IsNullOrEmpty(code))
                query = query.Where(q => q.Code.Contains(code));

            if (!string.IsNullOrEmpty(name))
                query = query.Where(q => q.Name.Contains(name));

            return await query.ToListAsync();
        }

        public async Task AddAsync(Qualification qualification)
        {
            await _context.Qualifications.AddAsync(qualification);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Qualification qualification)
        {
            _context.Qualifications.Update(qualification);
            await _context.SaveChangesAsync();
        }
    }
}