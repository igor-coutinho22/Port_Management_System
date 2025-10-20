using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.Vessels.VesselType;

namespace WebApp.Models.Infrastructure.Repositories.VesselTypeRepository
{
    public class VesselTypeRepository : IVesselTypeRepository
    {
        private readonly PortManagementContext _context;

        public VesselTypeRepository(PortManagementContext context)
        {
            _context = context;
        }

        public async Task<List<VesselType>> GetAllAsync() => await _context.VesselTypes.ToListAsync();

        public async Task<VesselType?> GetByNameAsync(string name) =>
            await _context.VesselTypes.FirstOrDefaultAsync(vt => vt.Name == name);

        public async Task<List<VesselType>> SearchByNameAsync(string partialName) =>
            await _context.VesselTypes
                .Where(vt => vt.Name.Contains(partialName))
                .ToListAsync();

        public async Task<List<VesselType>> SearchByDescriptionAsync(string keyword) =>
            await _context.VesselTypes
                .Where(vt => vt.Description.Contains(keyword))
                .ToListAsync();

        public async Task AddAsync(VesselType vesselType)
        {
            var exists = await _context.VesselTypes.AnyAsync(vt => vt.Name == vesselType.Name);
            if (exists)
                throw new InvalidOperationException($"A vessel type with the name '{vesselType.Name}' already exists.");

            await _context.VesselTypes.AddAsync(vesselType);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(string currentName, VesselType updatedVesselType)
        {
            var existing = await _context.VesselTypes.FirstOrDefaultAsync(vt => vt.Name == currentName);
            if (existing == null)
                throw new KeyNotFoundException($"Vessel type '{currentName}' not found.");

            var nameChanged = !currentName.Equals(updatedVesselType.Name, StringComparison.Ordinal);
            if (nameChanged)
            {
                var nameExists = await _context.VesselTypes.AnyAsync(vt => vt.Name == updatedVesselType.Name);
                if (nameExists)
                    throw new InvalidOperationException($"A vessel type with the name '{updatedVesselType.Name}' already exists.");
            }

            existing.Name = updatedVesselType.Name;
            existing.Description = updatedVesselType.Description;
            existing.MaxBays = updatedVesselType.MaxBays;
            existing.MaxRows = updatedVesselType.MaxRows;
            existing.MaxTiers = updatedVesselType.MaxTiers;

            _context.VesselTypes.Update(existing);
            await _context.SaveChangesAsync();
        }
    }
}
