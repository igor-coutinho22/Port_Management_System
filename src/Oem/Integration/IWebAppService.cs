using Oem.Models.Application.DTOs;

public interface IWebAppService
    {
        Task<bool> IsVesselValidAsync(string vesselImo);
        Task<bool> IsDockValidAsync(Guid dockId);
        Task<VesselVisitNotificationDTO?> GetVesselVisitByIdAsync(Guid vesselVisitId);
        Task<List<VesselVisitNotificationDTO>> GetApprovedVisitsForDateAsync(DateOnly date);
    }