using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.Qualifications;
using WebApp.Models.Domain.Qualifications.Interfaces;

namespace WebApp.Models.Infrastructure.Repositories.Qualifications
{
    public class QualificationRepository : IQualificationRepository
    {
        private readonly PortManagementContext _context;

        public QualificationRepository(PortManagementContext context)
        {
            _context = context;
        }

        // ---------- Synchronous ----------
        public void Add(Qualification qualification)
        {
            _context.Qualifications.Add(qualification);
            _context.SaveChanges();
        }

        public Qualification? GetByCode(string code) =>
            _context.Qualifications
                .FirstOrDefault(q => q.Code.ToLower() == code.ToLower());

        public Qualification? GetByName(string name) =>
            _context.Qualifications
                .FirstOrDefault(q => q.Name.ToLower() == name.ToLower());

        public List<Qualification> GetAll() =>
            _context.Qualifications.ToList();

        public void Update(Qualification qualification)
        {
            _context.Qualifications.Update(qualification);
            _context.SaveChanges();
        }

        public void Delete(string code)
        {
            var qualification = _context.Qualifications
                .FirstOrDefault(q => q.Code.ToLower() == code.ToLower());

            if (qualification == null)
                throw new KeyNotFoundException($"Qualification '{code}' not found.");

            _context.Qualifications.Remove(qualification);
            _context.SaveChanges();
        }

        // ---------- Asynchronous ----------
        public async Task AddAsync(Qualification qualification)
        {
            await _context.Qualifications.AddAsync(qualification);
            await _context.SaveChangesAsync();
        }

        public async Task<Qualification?> GetByCodeAsync(string code) =>
            await _context.Qualifications
                .FirstOrDefaultAsync(q => q.Code.ToLower() == code.ToLower());

        public async Task<Qualification?> GetByNameAsync(string name) =>
            await _context.Qualifications
                .FirstOrDefaultAsync(q => q.Name.ToLower() == name.ToLower());

        public async Task<List<Qualification>> GetAllAsync() =>
            await _context.Qualifications.ToListAsync();

        public async Task UpdateAsync(Qualification qualification)
        {
            _context.Qualifications.Update(qualification);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(string code)
        {
            var qualification = await _context.Qualifications
                .FirstOrDefaultAsync(q => q.Code.ToLower() == code.ToLower());

            if (qualification == null)
                throw new KeyNotFoundException($"Qualification '{code}' not found.");

            _context.Qualifications.Remove(qualification);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Qualification qualification)
        {
            _context.Qualifications.Remove(qualification);
            await _context.SaveChangesAsync();
        }
    }
}
