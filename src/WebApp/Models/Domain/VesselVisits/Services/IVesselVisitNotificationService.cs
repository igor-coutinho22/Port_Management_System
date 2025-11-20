using WebApp.Models.Application.DTOs;

namespace WebApp.Models.Domain.VesselVisits.Services
{
    public interface IVesselVisitNotificationService
    {
        Task<IEnumerable<VesselVisitNotificationDTO>> GetAllAsync();
        Task<IEnumerable<VesselVisitNotificationDTO>> SearchAsync(VesselVisitNotificationFilterDTO filter);
        Task<VesselVisitNotification?> GetByIdAsync(Guid id);
        Task CreateAsync(VesselVisitNotification vvn);
        Task UpdateAsync(Guid id, VesselVisitNotification vvn);
        Task SubmitAsync(Guid id);
        Task ApproveAsync(Guid id, Guid dockId);
        Task RejectAsync(Guid id,string reason);
        Task DeleteVesselAsync(Guid id);
    }
}
