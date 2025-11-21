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
<<<<<<< Updated upstream
        Task RejectAsync(Guid id,string reason);
=======
        Task AddLoadingManifestAsync(Guid id, CargoManifest manifest);
        Task AddUnloadingManifestAsync(Guid id, CargoManifest manifest);
        Task RemoveLoadingManifestAsync(Guid id);
        Task RemoveUnloadingManifestAsync(Guid id);
        Task AddCrewMemberAsync(Guid id, CrewMember crewMember);
        Task RemoveCrewMemberAsync(Guid id, string citizenId);  
        Task RejectAsync(Guid id, string reason);
>>>>>>> Stashed changes
        Task DeleteVesselAsync(Guid id);
    }
}
