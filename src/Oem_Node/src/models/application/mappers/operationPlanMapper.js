const OperationPlan = require('../../domain/operationPlans/operationPlan');
const { OperationPlanDTO, OperationPlanItemDTO } = require('../dtos/operationPlanDTOs');
const PlanItemUpdateInfo = require('../../domain/operationPlans/planItemUpdateInfo');

class OperationPlanMapper {

    // 1. Domain -> DTO (Reading from DB)
    static toDTO(domain) {
        if (!domain) return null;

        const dto = new OperationPlanDTO({
            id: domain.id,
            scheduleDate: domain.scheduleDate,
            heuristicUsed: domain.heuristicUsed,
            status: domain.status,
            totalDelayMinutes: domain.totalDelayMinutes,
            runtimeSeconds: domain.algorithmRuntimeSeconds,
            author: domain.author,
            items: (domain.items || []).map(i => new OperationPlanItemDTO({
                id: i.id,
                vesselVisitId: i.vesselVisitId,
                vesselIMO: i.vesselIMO,
                serviceStartTime: i.serviceStartTime,
                serviceEndTime: i.serviceEndTime,
                unloadingStartTime: i.unloadingStartTime,
                unloadingEndTime: i.unloadingEndTime,
                loadingStartTime: i.loadingStartTime,
                loadingEndTime: i.loadingEndTime,
                numberOfCranes: i.numberOfCranes,
                numberOfStaff: i.numberOfStaff
            }))
        });

        return dto;
    }

    // 2. DTO -> Domain (Creating new Plan)
    // visitInfoMap is expected to be a JS Object: { "guid-string": VesselVisitNotificationDTO }
    static toDomain(dto, visitInfoMap) {
        // 1. Create the Parent Plan
        const plan = new OperationPlan({
            scheduleDate: dto.scheduleDate,
            heuristicUsed: dto.heuristicUsed,
            totalDelayMinutes: dto.totalDelayMinutes,
            algorithmRuntimeSeconds: dto.runtimeSeconds,
            author: dto.author,
            items: []
        });

        // 2. Process Entries
        if (dto.entries && dto.entries.length > 0) {
            for (const entry of dto.entries) {
                
                // Safety check: ensure we have info for this visit
                const visitData = visitInfoMap[entry.vesselVisitId];
                if (!visitData) {
                    continue; // Skip if missing
                }

                // --- STEP A: Calculate Time Windows FIRST ---
                const serviceStart = new Date(entry.startTime);
                const serviceEnd = new Date(entry.endTime);

                // Calculate Ratio: Actual Allocated Time / Theoretical Needed Time
                const theoreticalMinutes = visitData.estimatedUnloadingDurationMinutes + visitData.estimatedLoadingDurationMinutes;
                
                // JS Date Math: (Date - Date) = milliseconds. Divide by 60000 for minutes.
                const allocatedMinutes = (serviceEnd - serviceStart) / 60000;

                // Avoid divide by zero
                const ratio = theoreticalMinutes > 0 ? (allocatedMinutes / theoreticalMinutes) : 1;

                // Calculate Unloading Window
                const unloadStart = new Date(serviceStart); // Clone date
                // Add minutes to date: new Date(old.getTime() + minutes * 60000)
                const unloadEnd = new Date(unloadStart.getTime() + (visitData.estimatedUnloadingDurationMinutes * ratio * 60000));

                // Calculate Loading Window (Immediately follows Unloading)
                const loadStart = new Date(unloadEnd); // Clone
                const loadEnd = new Date(loadStart.getTime() + (visitData.estimatedLoadingDurationMinutes * ratio * 60000));

                // Effective Resources
                const effectiveCranes = entry.numberOfCranes > 0 ? entry.numberOfCranes : 1;
                
                let calculatedStaff = 0;
                if (entry.staffMecNumbers && entry.staffMecNumbers.length > 0) {
                    calculatedStaff = entry.staffMecNumbers.length;
                } else {
                    calculatedStaff = effectiveCranes * 2;
                }

                // --- STEP B: Create Item Object ---
                // Since Mongoose uses subdocuments, we just create the object structure defined in the Schema.
                const itemData = {
                    vesselVisitId: entry.vesselVisitId,
                    vesselIMO: entry.vesselIMO,
                    serviceStartTime: serviceStart,
                    serviceEndTime: serviceEnd,
                    unloadingStartTime: unloadStart,
                    unloadingEndTime: unloadEnd,
                    loadingStartTime: loadStart,
                    loadingEndTime: loadEnd,
                    numberOfCranes: entry.numberOfCranes,
                    numberOfStaff: calculatedStaff
                };

                // --- STEP C: Add to Parent ---
                plan.addItem(itemData);
            }
        }

        return plan;
    }

    // 3. Apply Update
    static applyUpdate(plan, updateDto) {
        // 1. Convert DTO -> Value Object
        const updateInfo = new PlanItemUpdateInfo(
            updateDto.item.itemId,
            updateDto.item.serviceStartTime,
            updateDto.item.serviceEndTime,
            updateDto.item.numberOfCranes,
            updateDto.item.numberOfStaff,
            updateDto.item.minUnloadMinutes,
            updateDto.item.minLoadMinutes
        );

        // 2. Call Domain Method (Mongoose Model Instance Method)
        // This triggers the validation and audit logging defined in your Domain Schema
        plan.updateItem(updateInfo, updateDto.author, updateDto.reason);
    }
}

module.exports = OperationPlanMapper;