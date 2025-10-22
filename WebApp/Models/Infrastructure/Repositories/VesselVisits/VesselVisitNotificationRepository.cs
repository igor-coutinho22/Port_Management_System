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

        public async Task<VesselVisitNotification?> GetByIdAsync(Guid id)
            => await _context.VesselVisitNotifications
                .Include(v => v.Crew)
                .Include(v => v.LoadingManifest).ThenInclude(m => m.Containers)
                .Include(v => v.UnloadingManifest).ThenInclude(m => m.Containers)
                .FirstOrDefaultAsync(v => v.Id == id);

        public async Task AddAsync(VesselVisitNotification entity)
        {
            _context.VesselVisitNotifications.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(VesselVisitNotification entity)
        {
            _context.VesselVisitNotifications.Update(entity);
            await _context.SaveChangesAsync();
        }
    }
}
