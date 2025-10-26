using WebApp.Models.Application.DTOs;

namespace WebApp.Models.Domain.VesselVisits.Services
{
    public interface IVesselVisitNotificationService
    {
        Task<IEnumerable<VesselVisitNotificationDTO>> GetAllAsync();
        Task<VesselVisitNotificationDTO?> GetByIdAsync(Guid id);
        Task<VesselVisitNotificationDTO> CreateAsync(VesselVisitNotificationDTO dto);
        Task SubmitAsync(Guid id);
    }
}
