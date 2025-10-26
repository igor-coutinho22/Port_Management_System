using WebApp.Models.Application.DTOs;

namespace WebApp.Models.Domain.VesselVisits.Services
{
    public interface IVesselVisitNotificationService
    {
        Task<IEnumerable<VesselVisitNotificationDTO>> GetAllAsync();
        Task<IEnumerable<VesselVisitNotificationDTO>> SearchAsync(VesselVisitNotificationFilterDTO filter);
        Task<VesselVisitNotificationDTO?> GetByIdAsync(Guid id);
        Task<VesselVisitNotificationDTO> CreateAsync(VesselVisitNotificationDTO dto);
        Task UpdateAsync(Guid id, VesselVisitNotification vvn);
        Task SubmitAsync(Guid id);
        Task ApproveAsync(Guid id, Guid officerId, Guid dockId);
        Task RejectAsync(Guid id, Guid officerId, string reason);

    }
}
