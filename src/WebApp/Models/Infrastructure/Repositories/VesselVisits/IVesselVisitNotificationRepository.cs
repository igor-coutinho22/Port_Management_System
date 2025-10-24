using WebApp.Models.Domain.VesselVisits;

namespace WebApp.Models.Infrastructure.Repositories
{
    public interface IVesselVisitNotificationRepository
    {
        Task<VesselVisitNotification?> GetByIdAsync(Guid id);
        Task AddAsync(VesselVisitNotification entity);
        Task UpdateAsync(VesselVisitNotification entity);
    }
}
