namespace Oem.Models.Domain.VesselVisitExecutions
{
    public interface IVesselVisitExecutionRepository
    {
        Task AddAsync(VesselVisitExecution vesselVisitExecution);
        Task<VesselVisitExecution?> GetByIdAsync(Guid id);
        Task<IEnumerable<VesselVisitExecution>> GetAllAsync();
        Task DeleteAsync(VesselVisitExecution vesselVisitExecution);
    }
}
