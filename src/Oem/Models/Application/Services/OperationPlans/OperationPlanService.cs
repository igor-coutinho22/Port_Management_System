using Microsoft.EntityFrameworkCore;
using Oem.Models.Application.DTOs;
using Oem.Models.Context;
using Oem.Models.Domain.OperationPlans;
using Oem.Models.Domain.OperationPlans.Enums;
using Oem.Models.Domain.OperationPlans.Service;
using Oem.Models.Domain.Scheduling.Services;
using Oem.Models.DTOs.OperationPlans;
using Oem.Models.Mappers;

namespace Oem.Models.Application.Services
{
    public class OperationPlanService : IOperationPlanService
    {
        private readonly IOperationPlanRepository _repository;
        private readonly IWebAppService _webAppService;
        private readonly IHeuristicScheduleService _heuristicService;

        public OperationPlanService(
            IOperationPlanRepository repository,
            IWebAppService webAppService,
            IHeuristicScheduleService heuristicService)
        {
            _repository = repository;
            _webAppService = webAppService;
            _heuristicService = heuristicService;
        }

        public async Task<IEnumerable<OperationPlan?>> SearchPlansAsync(DateOnly? startDate, DateOnly? endDate, string? vesselIMO)
        {
            return await _repository.SearchPlansAsync(startDate, endDate, vesselIMO);
        }

        public async Task<OperationPlan?> GetPlanByIdAsync(Guid Id)
        {
            return await _repository.GetByIdAsync(Id);
        }

        public async Task SavePlanAsync(OperationPlan plan)
        {
            if (plan == null)
            {
                throw new ArgumentNullException(nameof(plan));
            }

            var existingPlan = await _repository.GetByIdAsync(plan.Id);
            if (existingPlan != null)
            {
                throw new ArgumentException($"An operation plan with ID: {plan.Id} already exists.");
            }

            await _repository.AddAsync(plan);
        }

        public async Task<IEnumerable<OperationPlan>> GetAllPlansAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task DeletePlanAsync(Guid Id)
        {
            var plan = await _repository.GetByIdAsync(Id);
            if (plan == null)
            {
                throw new ArgumentException($"Operation Plan with ID: {Id} does not exist.");
            }

            await _repository.DeleteAsync(plan);
        }

        public async Task<OperationPlan> UpdatePlanAsync(Guid id, UpdateOperationPlanDTO dto)
        {
            // 1. Fetch (Tracking enabled)
            var plan = await _repository.GetByIdAsync(id);

            if (plan == null)
                throw new KeyNotFoundException($"No plan found with ID {id}");

            if (plan.Status == OperationPlanStatus.Executed)
                throw new InvalidOperationException("Cannot update a plan that has already been executed.");

            // 2. Apply Domain Logic (This adds the new AuditLog to the list)
            OperationPlanMapper.ApplyUpdate(plan, dto);

            // 3. Persist
            // Pass the plan to the repo so it can fix the AuditLog states before saving
            await _repository.UpdateAsync();

            return plan;
        }

        public async Task<IEnumerable<VesselVisitNotificationDTO>> GetMissingPlanVVNsAsync(DateOnly date)
        {
            // 1. Get all approved visits for the date
            var allVisits = await _webAppService.GetApprovedVisitsForDateAsync(date);
            if (allVisits == null || !allVisits.Any()) return Enumerable.Empty<VesselVisitNotificationDTO>();

            // 2. Get existing plan (Using Search because GetByDate isn't available)
            // Plans for exactly this date
            var plans = await _repository.SearchPlansAsync(date, null, null);
            
            // 3. If no plan, all are missing
            if (plans == null || !plans.Any()) return allVisits;

            // 4. Return visits NOT in plan
            // Plan Items store VesselVisitId
            // We need to check against ALL plans for that day (though typically only 1)
            var plannedVisitIds = new HashSet<Guid>();
            foreach (var plan in plans)
            {
                if (plan?.Items != null)
                {
                    foreach (var item in plan.Items)
                    {
                        plannedVisitIds.Add(item.VesselVisitId);
                    }
                }
            }

            return allVisits.Where(v => !plannedVisitIds.Contains(v.Id));
        }

        public async Task<OperationPlan> RegeneratePlanAsync(DateOnly date, string heuristicName, string author)
        {
            // 1. Generate new schedule using Heuristic Service
            var result = await _heuristicService.GenerateDailyScheduleAsync(date, heuristicName);
            
            // 2. Convert to OperationPlan (Domain)
            var newPlan = new OperationPlan(
                date, 
                heuristicName, 
                result.TotalDelayMinutes, 
                result.RuntimeSeconds, 
                author);

            foreach (var entry in result.Entries)
            {
                // Simple logic: Service Time is the allocation
                // Split Load/Unload evenly for now as per heuristics result limitation
                // Or use 0 duration if not specified
                
                newPlan.AddItem(new OperationPlanItem(
                    newPlan.Id,
                    entry.VesselVisitId,
                    entry.VesselIMO,
                    entry.StartTime,
                    entry.EndTime,
                    entry.StartTime, // Unload Start
                    entry.StartTime.AddMinutes((entry.EndTime - entry.StartTime).TotalMinutes / 2), // Unload End
                    entry.StartTime.AddMinutes((entry.EndTime - entry.StartTime).TotalMinutes / 2), // Load Start
                    entry.EndTime,   // Load End
                    entry.NumberOfCranes,
                    0 // Default Staff? Or should Heuristic provide it? Currently 0 or derived.
                ));
            }

            // 3. Check for existing plan and Delete
            var existingPlans = await _repository.SearchPlansAsync(date, null, null);
            if (existingPlans != null)
            {
                foreach (var existing in existingPlans)
                {
                    if (existing != null)
                         await _repository.DeleteAsync(existing);
                }
            }

            // 4. Save new plan
            await _repository.AddAsync(newPlan);
            
            return newPlan;
        }

        public async Task<IEnumerable<ResourceUtilizationDTO>> GetResourceUtilizationAsync(DateOnly startDate, DateOnly endDate, string resourceType)
        {
            // 1. Fetch Plans
            var plans = await _repository.SearchPlansAsync(startDate, endDate, null);
            
            if (plans == null || !plans.Any())
                return Enumerable.Empty<ResourceUtilizationDTO>();

            // 2. Flatten Items
            var allItems = plans
                .Where(p => p != null)
                .SelectMany(p => p!.Items)
                .ToList();

            var result = new List<ResourceUtilizationDTO>();

            // 3. Aggregate based on Type
            if (string.Equals(resourceType, "crane", StringComparison.OrdinalIgnoreCase))
            {
                // For cranes, we might want to group by "Crane" if we had IDs, but we have "NumberOfCranes".
                // So checking "Total Crane Time" means Time * Count?
                // Or just the sum of durations where cranes are used?
                // Requirement: "total allocation time of a specific resource". 
                // Since we don't have Crane #1, Crane #2, we can only report "Total Crane-Hours" or similar.
                // Or maybe the user means "How much time was *at least one* crane used?".
                // Let's assume "Total Allocated Minute-Cranes" (Sum of Duration * N_Cranes) is the most useful metric for "Resource Utilization" 
                // in an aggregate sense, OR just "Total Time Cranes Were Busy" (Sum of Duration).
                // Let's provide an aggregate "Global Crane Usage".
                
                double totalMinutes = allItems.Sum(i => (i.ServiceEndTime - i.ServiceStartTime).TotalMinutes * i.NumberOfCranes);
                int totalOps = allItems.Count(i => i.NumberOfCranes > 0);
                
                result.Add(new ResourceUtilizationDTO 
                { 
                    ResourceName = "All Cranes (Aggregate)", 
                    TotalAllocatedMinutes = totalMinutes,
                    TotalOperations = totalOps
                });
            }
            else if (string.Equals(resourceType, "staff", StringComparison.OrdinalIgnoreCase))
            {
                double totalMinutes = allItems.Sum(i => (i.ServiceEndTime - i.ServiceStartTime).TotalMinutes * i.NumberOfStaff);
                int totalOps = allItems.Count(i => i.NumberOfStaff > 0);

                result.Add(new ResourceUtilizationDTO
                {
                    ResourceName = "All Staff (Aggregate)",
                    TotalAllocatedMinutes = totalMinutes,
                    TotalOperations = totalOps
                });
            }
            else if (string.Equals(resourceType, "dock", StringComparison.OrdinalIgnoreCase))
            {
                // Just sum duration, assuming 1 item = 1 dock slot occupied
                double totalMinutes = allItems.Sum(i => (i.ServiceEndTime - i.ServiceStartTime).TotalMinutes);
                int totalOps = allItems.Count;

                result.Add(new ResourceUtilizationDTO
                {
                    ResourceName = "Docks (Aggregate)",
                    TotalAllocatedMinutes = totalMinutes,
                    TotalOperations = totalOps
                });
            }
            else 
            {
                // Return all logic? Or empty?
                // Let's return a Summary of all known types
                 result.Add(new ResourceUtilizationDTO 
                { 
                    ResourceName = "Cranes (Total Time * Count)", 
                    TotalAllocatedMinutes = allItems.Sum(i => (i.ServiceEndTime - i.ServiceStartTime).TotalMinutes * i.NumberOfCranes),
                    TotalOperations = allItems.Count(i => i.NumberOfCranes > 0)
                });
                 result.Add(new ResourceUtilizationDTO 
                { 
                    ResourceName = "Staff (Total Time * Count)", 
                    TotalAllocatedMinutes = allItems.Sum(i => (i.ServiceEndTime - i.ServiceStartTime).TotalMinutes * i.NumberOfStaff),
                    TotalOperations = allItems.Count(i => i.NumberOfStaff > 0)
                });
                  result.Add(new ResourceUtilizationDTO 
                { 
                    ResourceName = "Docks (Total Duration)", 
                    TotalAllocatedMinutes = allItems.Sum(i => (i.ServiceEndTime - i.ServiceStartTime).TotalMinutes),
                    TotalOperations = allItems.Count
                });
            }

            return result;
        }
    }
}