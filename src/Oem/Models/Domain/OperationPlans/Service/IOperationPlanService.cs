using Oem.Models.DTOs.OperationPlans;

namespace Oem.Models.Domain.OperationPlans.Service
{
public interface IOperationPlanService
    {
        Task SavePlanAsync(OperationPlan plan);
        Task<OperationPlan?> GetPlanByDateAsync(DateOnly date);
        Task<OperationPlan?> GetPlanByIdAsync(Guid Id);
        Task DeletePlanAsync(Guid Id);
    }
}