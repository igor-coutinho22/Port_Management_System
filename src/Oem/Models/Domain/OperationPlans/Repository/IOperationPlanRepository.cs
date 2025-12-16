namespace Oem.Models.Domain.OperationPlans
{
    public interface IOperationPlanRepository
    {
        Task<IEnumerable<OperationPlan?>> GetByDateAsync(DateOnly date);
        Task<OperationPlan?> GetByIdAsync(Guid id);
        Task<IEnumerable<OperationPlan>> GetAllAsync();
        Task AddAsync(OperationPlan plan);
        Task UpdateAsync(OperationPlan plan);
        Task DeleteAsync(OperationPlan plan);
        Task<IEnumerable<OperationPlan>> SearchAsync(DateOnly? date, string? vesselIMO);
    }
}