using Oem.Models.Application.DTOs;
using Oem.Models.Domain.OperationPlans;
using Oem.Models.Domain.OperationPlans.Service;
using Oem.Models.Domain.Scheduling.Services;
using Oem.Models.DTOs.OperationPlans;

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

        /* public async Task<IEnumerable<OperationPlan>> SearchPlansAsync(DateOnly? date, string? vesselIMO)
        {
            return await _repository.SearchAsync(date, vesselIMO);
        }

        public async Task UpdatePlanAsync(Guid id, UpdateOperationPlanDTO dto)
        {
            var plan = await _repository.GetByIdAsync(id);
            if (plan == null)
            {
                throw new ArgumentException($"Operation Plan with ID: {id} not found.");
            }

            if (plan.Status != Oem.Models.Domain.OperationPlans.Enums.OperationPlanStatus.Draft) 
            {
               // Depending on requirements, maybe allow updates even if not Draft? 
               // US says "manual update... when needed". Usually implies before execution.
               // Let's allow it for now, or maybe log a warning.
            }

            
            // Use Mapper to apply updates
            Oem.Models.Mappers.OperationPlanMapper.ApplyUpdate(plan, dto);

            await _repository.UpdateAsync(plan);
        }

        public async Task<IEnumerable<VesselVisitNotificationDTO>> GetMissingPlanVVNsAsync(DateOnly date)
        {
            // 1. Get all approved visits for the date
            var allVisits = await _webAppService.GetApprovedVisitsForDateAsync(date);
            if (allVisits == null || !allVisits.Any()) return Enumerable.Empty<VesselVisitNotificationDTO>();

            // 2. Get existing plan
            var plans = await _repository.GetByDateAsync(date);
            
            // 3. If no plan, all are missing
            if (plans == null) return allVisits;

            // 4. Return visits NOT in plan
            // Plan Items store VesselVisitId
            foreach (var item in plans.Items)
            {
                allVisits = allVisits.Where(v => v.Id != item.VesselVisitId);
            }

            return allVisits;
        }

        public async Task<OperationPlan> RegeneratePlanAsync(DateOnly date, string heuristicName, string author)
        {
            // 1. Generate new schedule using Heuristic Service
            var result = await _heuristicService.GenerateDailyScheduleAsync(date, heuristicName);
            
            // 2. Convert to OperationPlan (Domain)
            // We need a mapper here. Since `OperationPlanMapper` is in Controller/Models, 
            // and this is Service, we might have circular dep if we use DTO mapper.
            // But we can map manually or assume I can instantiate OperationPlan.
            
            var newPlan = new OperationPlan(
                date, 
                heuristicName, 
                result.TotalDelayMinutes, 
                result.RuntimeSeconds, 
                author);

            foreach (var entry in result.Entries)
            {
                // We need to calculate Loading/Unloading times.
                // The generic heuristic result gives Start/End.
                // For now, let's assume they split the time or use full window.
                // Or better, let's see what VesselScheduleEntry has.
                // It has StartTime, EndTime.
                
                // Detailed logic:
                // ServiceTime = [Start, End]
                // Loading/Unloading? Simplification: Unloading = First Half, Loading = Second Half?
                // Or if we don't have that info, maybe use same window for now.
                // Ideally the heuristic should provide "Operations".
                // But for now, we'll map ServiceTime to both.
                
                newPlan.AddItem(new OperationPlanItem(
                    newPlan.Id,
                    entry.VesselVisitId,
                    entry.VesselIMO,
                    entry.StartTime,
                    entry.EndTime,
                    entry.StartTime, // Simplify
                    entry.EndTime,   // Simplify
                    entry.StartTime, // Simplify
                    entry.EndTime,   // Simplify
                    entry.NumberOfCranes
                ));
            }

            // 3. Check for existing plan
            var existingPlan = await _repository.GetByIdAsync(date);
            if (existingPlan != null)
            {
                // Delete explicitly
                await _repository.DeleteAsync(existingPlan);
            }

            // 4. Save new plan
            await _repository.AddAsync(newPlan);
            
            return newPlan;
        } */
    }
}