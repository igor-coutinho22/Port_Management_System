using WebApp.Models.Domain.VesselVisits;

namespace WebApp.Models.Domain.VesselVisits
{

    public interface IVesselVisitNotificationRepository
    {
        Task<IEnumerable<VesselVisitNotification>> GetAllAsync();
        Task<VesselVisitNotification?> GetByIdAsync(Guid id);
        Task AddAsync(VesselVisitNotification notification);
        Task UpdateAsync(VesselVisitNotification notification);
        Task DeleteAsync(VesselVisitNotification notification);
    }
}
