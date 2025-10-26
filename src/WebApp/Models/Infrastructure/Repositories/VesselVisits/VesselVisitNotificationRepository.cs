using Microsoft.EntityFrameworkCore;
using WebApp.Models.Context;
using WebApp.Models.Domain.VesselVisits;

namespace WebApp.Models.Infrastructure.Repositories
{

    public class VesselVisitNotificationRepository : IVesselVisitNotificationRepository
    {
        private readonly PortManagementContext _context;

        public VesselVisitNotificationRepository(PortManagementContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<VesselVisitNotification>> GetAllAsync()
        {
            return await _context.VesselVisitNotifications
                .Include(v => v.LoadingManifest)
                .Include(v => v.UnloadingManifest)
                .Include(v => v.Crew)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<VesselVisitNotification?> GetByIdAsync(Guid id)
        {
            return await _context.VesselVisitNotifications
                .Include(v => v.LoadingManifest)
                .Include(v => v.UnloadingManifest)
                .Include(v => v.Crew)
                .FirstOrDefaultAsync(v => v.Id == id);
        }

        public async Task AddAsync(VesselVisitNotification notification)
        {
            await _context.VesselVisitNotifications.AddAsync(notification);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(VesselVisitNotification notification)
        {
            _context.VesselVisitNotifications.Update(notification);
            await _context.SaveChangesAsync();
        }
    }
}
