namespace Oem.Models.Domain.OperationPlans
{
    public interface IOperationPlanRepository
    {
        Task<OperationPlan?> GetByDateAsync(DateOnly date);
        Task<OperationPlan?> GetByIdAsync(Guid id);
        Task AddAsync(OperationPlan plan);
        Task UpdateAsync(OperationPlan plan);
        Task DeleteAsync(OperationPlan plan);
    }
}