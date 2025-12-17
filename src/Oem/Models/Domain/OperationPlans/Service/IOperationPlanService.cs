using Oem.Models.Application.DTOs;
using Oem.Models.DTOs.OperationPlans;

namespace Oem.Models.Domain.OperationPlans.Service
{
public interface IOperationPlanService
    {
        Task SavePlanAsync(OperationPlan plan);
        Task<IEnumerable<OperationPlan?>> SearchPlansAsync(DateOnly? date, string? vesselIMO);
        Task<OperationPlan?> GetPlanByIdAsync(Guid Id);
        Task<IEnumerable<OperationPlan>> GetAllPlansAsync();
        Task DeletePlanAsync(Guid Id);
        /* Task<IEnumerable<OperationPlan>> SearchPlansAsync(DateOnly? date, string? vesselIMO);
        Task UpdatePlanAsync(Guid id, UpdateOperationPlanDTO dto);
        Task<IEnumerable<VesselVisitNotificationDTO>> GetMissingPlanVVNsAsync(DateOnly date);
        Task<OperationPlan> RegeneratePlanAsync(DateOnly date, string heuristicName, string author); */
    }
}