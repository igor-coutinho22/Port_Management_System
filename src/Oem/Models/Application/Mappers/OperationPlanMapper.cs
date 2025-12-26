using Oem.Models.Domain.OperationPlans;
using Oem.Models.DTOs.OperationPlans;
using Oem.Models.Application.DTOs;

namespace Oem.Models.Mappers
{
    public static class OperationPlanMapper
    {
        // 1. Domain -> DTO (Reading from DB) - No changes needed here
        public static OperationPlanDTO ToDto(OperationPlan? domain)
        {
            return new OperationPlanDTO
            {
                Id = domain!.Id,
                ScheduleDate = domain.ScheduleDate,
                HeuristicUsed = domain.HeuristicUsed,
                Status = domain.Status.ToString(),
                TotalDelayMinutes = domain.TotalDelayMinutes,
                RuntimeSeconds = domain.AlgorithmRuntimeSeconds,
                Author = domain.Author,
                Items = domain.Items.Select(i => new OperationPlanItemDTO
                {
                    Id = i.Id,
                    VesselVisitId = i.VesselVisitId,
                    VesselIMO = i.VesselIMO,
                    ServiceStartTime = i.ServiceStartTime,
                    ServiceEndTime = i.ServiceEndTime,
                    UnloadingStartTime = i.UnloadingStartTime,
                    UnloadingEndTime = i.UnloadingEndTime,
                    LoadingStartTime = i.LoadingStartTime,
                    LoadingEndTime = i.LoadingEndTime,
                    NumberOfCranes = i.NumberOfCranes,
                    NumberOfStaff = i.NumberOfStaff
                }).ToList()
            };
        }

        // 2. DTO -> Domain (Creating new Plan) - FIXED for new Constructor
        public static OperationPlan ToDomain(
            CreateOperationPlanDTO dto,
            Dictionary<Guid, VesselVisitNotificationDTO> visitInfoMap)
        {
            // 1. Create the Parent Plan
            var plan = new OperationPlan(
                dto.ScheduleDate,
                dto.HeuristicUsed,
                dto.TotalDelayMinutes,
                dto.RuntimeSeconds,
                dto.Author
            );

            foreach (var entry in dto.Entries)
            {
                // Safety check: ensure we have info for this visit
                if (!visitInfoMap.TryGetValue(entry.VesselVisitId, out var visitData))
                {
                    // If missing, you might skip or throw. Skipping is safer for now.
                    continue;
                }

                // --- STEP A: Calculate Time Windows FIRST ---

                DateTime serviceStart = entry.StartTime;
                DateTime serviceEnd = entry.EndTime;

                // Calculate Ratio: Actual Allocated Time / Theoretical Needed Time
                // This scales the loading/unloading windows to fit the Prolog result perfectly.
                double theoreticalMinutes = visitData.EstimatedUnloadingDurationMinutes + visitData.EstimatedLoadingDurationMinutes;
                double allocatedMinutes = (serviceEnd - serviceStart).TotalMinutes;

                // Avoid divide by zero
                double ratio = theoreticalMinutes > 0 ? allocatedMinutes / theoreticalMinutes : 1;

                // Calculate Unloading Window
                DateTime unloadStart = serviceStart;
                DateTime unloadEnd = unloadStart.AddMinutes(visitData.EstimatedUnloadingDurationMinutes * ratio);

                // Calculate Loading Window (Immediately follows Unloading)
                DateTime loadStart = unloadEnd;
                DateTime loadEnd = loadStart.AddMinutes(visitData.EstimatedLoadingDurationMinutes * ratio);

                int effectiveCranes = entry.NumberOfCranes > 0 ? entry.NumberOfCranes : 1;

                int calculatedStaff = entry.StaffMecNumbers?.Any() == true
                          ? entry.StaffMecNumbers.Count
                          : (effectiveCranes * 2);

                // --- STEP B: Instantiate using the Constructor ---

                var item = new OperationPlanItem(
                    plan.Id,
                    entry.VesselVisitId,
                    entry.VesselIMO,
                    serviceStart,
                    serviceEnd,
                    unloadStart,
                    unloadEnd,
                    loadStart,
                    loadEnd,
                    entry.NumberOfCranes,
                    calculatedStaff
                );

                // --- STEP C: Add to Parent ---
                plan.AddItem(item);
            }

            return plan;
        }

        public static void ApplyUpdate(OperationPlan plan, UpdateOperationPlanDTO dto)
        {
            // 1. Convert Single DTO -> Single Domain Object
            var updateInfo = new PlanItemUpdateInfo(
                dto.Item.ItemId,
                dto.Item.ServiceStartTime,
                dto.Item.ServiceEndTime,
                dto.Item.NumberOfCranes,
                dto.Item.NumberOfStaff,
                dto.Item.MinUnloadMinutes,
                dto.Item.MinLoadMinutes
            );

            // 2. Call Domain Method (Singular)
            plan.UpdateItem(updateInfo, dto.Author, dto.Reason);
        }
    }
}