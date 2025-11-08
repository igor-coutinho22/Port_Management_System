using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.Resources;
using WebApp.Models.Domain.Resources.Enums;
using WebApp.Models.Domain.Resources.Interfaces;

namespace WebApp.Models.Infrastructure.Repositories.Resources
{
    public class ResourceRepository : IResourceRepository
    {
        private readonly PortManagementContext _context;
        public ResourceRepository(PortManagementContext context)
        {
            _context = context;
        }
        public void AddResource(Resource resource)
        {
            _context.Resources.Add(resource);
            _context.SaveChanges();
        }

        public async Task AddResourceAsync(Resource resource)
        {
            // Attach existing qualifications to the context to prevent insertion attempts
            if (resource.qualificationRequirements != null)
            {
                foreach (var qualification in resource.qualificationRequirements)
                {
                    var existingQual = _context.Qualifications.Local.FirstOrDefault(q => q.Code == qualification.Code);
                    if (existingQual == null)
                    {
                        // Attach the qualification as unchanged to prevent EF from trying to insert it
                        _context.Entry(qualification).State = Microsoft.EntityFrameworkCore.EntityState.Unchanged;
                    }
                }
            }
            
            await _context.Resources.AddAsync(resource);
            await _context.SaveChangesAsync();
        }

        
        public Resource? GetById(string id) =>
            _context.Resources
                .Include(r => r.qualificationRequirements)
                .FirstOrDefault(r => r.Id == id);

        public async Task<Resource?> GetByIdAsync(string id) =>
            await _context.Resources
                .Include(r => r.qualificationRequirements)
                .FirstOrDefaultAsync(r => r.Id == id);

        public Resource? GetByDescription(string description) =>
            _context.Resources
                .Include(r => r.qualificationRequirements)
                .FirstOrDefault(r => r.Description!.Equals(description, StringComparison.OrdinalIgnoreCase));

         public async Task<Resource?> GetByDescriptionAsync(string description) =>
            await _context.Resources
                .Include(r => r.qualificationRequirements)
                .FirstOrDefaultAsync(r => r.Description!.Equals(description, StringComparison.OrdinalIgnoreCase));

        public List<Resource> GetAll() =>
            _context.Resources
                .Include(r => r.qualificationRequirements)
                .ToList();
        public async Task<List<Resource>> GetAllAsync() =>
            await _context.Resources
                .Include(r => r.qualificationRequirements)
                .ToListAsync();

        public List<Resource> GetByType(ResourceType type) =>
            _context.Resources
                .Include(r => r.qualificationRequirements)
                .Where(r => r.ResourceType == type)
                .ToList();

        public async Task<List<Resource>> GetByTypeAsync(ResourceType type) =>
            await _context.Resources
                .Include(r => r.qualificationRequirements)
                .Where(r => r.ResourceType == type)
                .ToListAsync();

        public List<Resource> GetByStatus(ResourceAvailabilityStatus status) =>
            _context.Resources
                .Include(r => r.qualificationRequirements)
                .Where(r => r.Status == status)
                .ToList();

        public async Task<List<Resource>> GetByStatusAsync(ResourceAvailabilityStatus status) =>
            await _context.Resources
                .Include(r => r.qualificationRequirements)
                .Where(r => r.Status == status)
                .ToListAsync();

        public async Task UpdateAsync(Resource resource)
        {
            _context.Resources.Update(resource);
            await _context.SaveChangesAsync();
        }

        public void UpdateAvailability(string id, ResourceAvailabilityStatus newStatus)
        {
            var resource = _context.Resources.FirstOrDefault(r => r.Id == id);
            if (resource == null)
                throw new KeyNotFoundException($"Resource with ID '{id}' not found.");

            resource.Status = newStatus;
            _context.SaveChanges();
        }

       public async Task UpdateAvailabilityAsync(string id, ResourceAvailabilityStatus newStatus)
        {
            var resource = await _context.Resources.FirstOrDefaultAsync(r => r.Id == id);
            if (resource == null)
                throw new KeyNotFoundException($"Resource with ID '{id}' not found.");

            resource.Status = newStatus;
            await _context.SaveChangesAsync();
        }

        public async Task UpdateResourceAsync(Resource resource)
        {
            _context.Resources.Update(resource);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            var resource = await _context.Resources.FirstOrDefaultAsync(r => r.Id == id);
            if (resource == null)
                throw new KeyNotFoundException($"Resource with ID '{id}' not found.");

            _context.Resources.Remove(resource);
            await _context.SaveChangesAsync();
        }
    }
}