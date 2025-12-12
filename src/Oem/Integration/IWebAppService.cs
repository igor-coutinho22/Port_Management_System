public interface IWebAppService
    {
        Task<bool> IsVesselValidAsync(string vesselImo);
        Task<bool> IsDockValidAsync(Guid dockId);
    }