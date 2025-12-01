using WebApp.Models.Domain.VesselVisits;

namespace WebApp.Models.Domain.VesselVisits
{

    public interface IVesselVisitNotificationRepository
    {
        Task<IEnumerable<VesselVisitNotification>> GetAllAsync();
        Task<IEnumerable<VesselVisitNotification>> GetAllOnOrgAsync(Guid organizationId);
        Task<VesselVisitNotification?> GetByIdAsync(Guid id);
        Task AddAsync(VesselVisitNotification notification);
        Task UpdateAsync(VesselVisitNotification notification);
        Task DeleteAsync(VesselVisitNotification notification);
        Task SaveLMAsync(CargoManifest manifest);
        Task SaveUMAsync(CargoManifest manifest);
        Task SaveCMAsync(CrewMember crewMember);
        Task DeleteLMAsync(CargoManifest manifest);
        Task DeleteUMAsync(CargoManifest manifest);
        Task DeleteCMAsync(CrewMember crewMember);
        Task UpdateStatusToApprovedAsync(VesselVisitNotification notification, DecisionLog decisionLog);
        Task UpdateStatusToRejectedAsync(VesselVisitNotification notification, DecisionLog decisionLog);
    }
}