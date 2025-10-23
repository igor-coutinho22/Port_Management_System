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

        public async Task<List<VesselType>> GetAllVesselTypesAsync() => await _context.VesselTypes.ToListAsync();

        public async Task<VesselType?> GetVesselTypeByNameAsync(string name) =>
            await _context.VesselTypes.FirstOrDefaultAsync(vt => vt.Name == name);

        public async Task<List<VesselType>> SearchVesselTypeByNameAsync(string partialName) =>
            await _context.VesselTypes
                .Where(vt => vt.Name.Contains(partialName))
                .ToListAsync();

        public async Task<List<VesselType>> SearchVesselTypeByDescriptionAsync(string keyword) =>
            await _context.VesselTypes
                .Where(vt => vt.Description.Contains(keyword))
                .ToListAsync();

        public async Task AddVesselTypeAsync(VesselType vesselType)
        {
            var exists = await _context.VesselTypes.AnyAsync(vt => vt.Name == vesselType.Name);
            if (exists)
                throw new InvalidOperationException($"A vessel type with the name '{vesselType.Name}' already exists.");

            await _context.VesselTypes.AddAsync(vesselType);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateVesselTypeAsync(VesselType updatedVesselType)
        {
            _context.VesselTypes.Update(updatedVesselType);
            await _context.SaveChangesAsync();
        }
    }
}
