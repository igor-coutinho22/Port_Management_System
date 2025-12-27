namespace Oem.Models.Domain.VesselVisitExecutions
{
    public interface IVesselVisitExecutionService
    {
        Task CreateVesselVisitExecutionAsync(VesselVisitExecution vesselVisitExecution);
        Task<VesselVisitExecution?> GetVesselVisitExecutionByIdAsync(Guid id);
        Task<IEnumerable<VesselVisitExecution>> GetAllVesselVisitExecutionsAsync();
        Task DeleteVesselVisitExecutionAsync(Guid id);
    }
}