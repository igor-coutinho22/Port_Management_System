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
                .Include(v => v.LoadingManifest).ThenInclude(m => m!.Containers)
                .Include(v => v.UnloadingManifest).ThenInclude(m => m!.Containers)
                .Include(v => v.Crew)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<VesselVisitNotification?> GetByIdAsync(Guid id)
        {
            return await _context.VesselVisitNotifications
                .Include(v => v.LoadingManifest).ThenInclude(m => m!.Containers)
                .Include(v => v.UnloadingManifest).ThenInclude(m => m!.Containers)
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

        public async Task DeleteAsync(VesselVisitNotification notification)
        {
            _context.VesselVisitNotifications.Remove(notification);
            await _context.SaveChangesAsync();
        }

        public async Task SaveLMAsync(CargoManifest manifest)
        {
            await _context.CargoManifests.AddAsync(manifest);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteLMAsync(CargoManifest manifest)
        {
            _context.CargoManifests.Attach(manifest);
            _context.CargoManifests.Remove(manifest);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteUMAsync(CargoManifest manifest)
        {
            _context.CargoManifests.Remove(manifest);
            await _context.SaveChangesAsync();
        }

        public async Task SaveUMAsync(CargoManifest manifest)
        {
            await _context.CargoManifests.AddAsync(manifest);
            await _context.SaveChangesAsync();
        }

        public async Task SaveCMAsync(CrewMember crewMember)
        {
            await _context.CrewMembers.AddAsync(crewMember);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteCMAsync(CrewMember crewMember)
        {
            _context.CrewMembers.Remove(crewMember);
            await _context.SaveChangesAsync();
        }
    }
}