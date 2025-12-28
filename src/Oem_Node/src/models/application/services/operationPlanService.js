const repository = require('../../infrastructure/repositories/operationPlanRepository'); //
const webAppService = require('../../infrastructure/integration/webAppService'); //
const heuristicService = require('./scheduling/heuristicScheduleService'); //
const OperationPlanMapper = require('../mappers/operationPlanMapper'); //
const OperationPlan = require('../../domain/operationPlans/operationPlan'); //
const OperationPlanStatus = require('../../domain/operationPlans/enums/operationPlanStatus'); //

class OperationPlanService {

    async searchPlans(startDate, endDate, vesselIMO) {
        return await repository.searchPlansAsync(startDate, endDate, vesselIMO);
    }

    async getPlanById(id) {
        return await repository.getByIdAsync(id);
    }

    async savePlan(plan) {
        if (!plan) throw new Error('ArgumentNullException: plan');
        
        const existing = await repository.getByIdAsync(plan.id);
        if (existing) {
            throw new Error(`An operation plan with ID: ${plan.id} already exists.`);
        }

        await repository.addAsync(plan);
    }

    async getAllPlans() {
        return await repository.getAllAsync();
    }

    async deletePlan(id) {
        const plan = await repository.getByIdAsync(id);
        if (!plan) {
            throw new Error(`Operation Plan with ID: ${id} does not exist.`);
        }
        await repository.deleteAsync(plan);
    }

    async updatePlan(id, dto) {
        const plan = await repository.getByIdAsync(id);
        if (!plan) throw new Error(`No plan found with ID ${id}`);

        if (plan.status === OperationPlanStatus.Executed) {
            throw new Error('Cannot update a plan that has already been executed.');
        }

        // Apply Domain Logic via Mapper
        OperationPlanMapper.applyUpdate(plan, dto);

        // Persist changes
        await repository.saveChangesAsync(plan);
        
        return plan;
    }

    async getMissingPlanVVNs(date, token) {
        // 1. Get Approved Visits from WebApp (Pass token)
        const allVisits = await webAppService.getApprovedVisitsForDate(date, token);
        if (!allVisits || allVisits.length === 0) return [];

        // 2. Get Existing Plans for Date
        const plans = await repository.searchPlansAsync(date, null, null);

        if (!plans || plans.length === 0) return allVisits;

        // 3. Find IDs already in a plan (Flatten items from all plans)
        const plannedIds = new Set();
        plans.forEach(p => {
            // Only care about approved plans or non-empty items
            if (p.status === OperationPlanStatus.Approved && p.items) {
                p.items.forEach(i => plannedIds.add(i.vesselVisitId));
            }
        });

        // 4. Return visits NOT in plan
        return allVisits.filter(v => !plannedIds.has(v.id));
    }

    async regeneratePlan(date, heuristicName, author, token) {
        // 1. Generate new schedule (Pass token)
        const result = await heuristicService.generateDailySchedule(date, heuristicName, token);

        // Fetch Visits to get loading/unloading details needed for Mapper
        // Need this because HeuristicService returns minimal info, but OperationPlan requires full details.
        const visits = await webAppService.getApprovedVisitsForDate(date, token);
        const visitMap = {};
        if(visits) {
            visits.forEach(v => visitMap[v.id] = v);
        }

        // 2. Convert to Domain via Mapper
        // Simulate a CreateDTO structure for the Mapper
        const createDtoStub = {
            scheduleDate: new Date(date),
            heuristicUsed: heuristicName,
            totalDelayMinutes: result.totalDelayMinutes,
            runtimeSeconds: result.runtimeSeconds,
            author: author,
            entries: result.entries // The mapper iterates over these
        };

        const newPlan = OperationPlanMapper.toDomain(createDtoStub, visitMap);

        // 3. Delete existing draft plans with same heuristic to replace them
        const existingPlans = await repository.searchPlansAsync(date, null, null);
        for (const existing of existingPlans) {
            if (existing.heuristicUsed === heuristicName && existing.status === OperationPlanStatus.Draft) {
                await repository.deleteAsync(existing);
            }
        }

        // 4. Save new plan
        await repository.addAsync(newPlan);
        return newPlan;
    }

    async getResourceUtilization(startDate, endDate, resourceType) {
        const plans = await repository.searchPlansAsync(startDate, endDate, null);
        if (!plans || plans.length === 0) return [];

        const allItems = plans.flatMap(p => p.items);
        const result = [];

        // Helper to sum duration (minutes)
        const sumDuration = (items, multiplierFn) => {
            return items.reduce((acc, i) => {
                const minutes = (i.serviceEndTime - i.serviceStartTime) / 60000;
                return acc + (minutes * multiplierFn(i));
            }, 0);
        };

        const type = resourceType ? resourceType.toLowerCase() : '';

        if (type === 'crane') {
            result.push({
                resourceName: "All Cranes (Aggregate)",
                totalAllocatedMinutes: sumDuration(allItems, i => i.numberOfCranes),
                totalOperations: allItems.filter(i => i.numberOfCranes > 0).length
            });
        } else if (type === 'staff') {
            result.push({
                resourceName: "All Staff (Aggregate)",
                totalAllocatedMinutes: sumDuration(allItems, i => i.numberOfStaff),
                totalOperations: allItems.filter(i => i.numberOfStaff > 0).length
            });
        } else if (type === 'dock') {
            result.push({
                resourceName: "Docks (Aggregate)",
                totalAllocatedMinutes: sumDuration(allItems, i => 1),
                totalOperations: allItems.length
            });
        } else {
             // Return summary of all
             result.push({
                resourceName: "Cranes (Total Time * Count)",
                totalAllocatedMinutes: sumDuration(allItems, i => i.numberOfCranes),
                totalOperations: allItems.filter(i => i.numberOfCranes > 0).length
            });
             result.push({
                resourceName: "Staff (Total Time * Count)",
                totalAllocatedMinutes: sumDuration(allItems, i => i.numberOfStaff),
                totalOperations: allItems.filter(i => i.numberOfStaff > 0).length
            });
             result.push({
                resourceName: "Docks (Total Duration)",
                totalAllocatedMinutes: sumDuration(allItems, i => 1),
                totalOperations: allItems.length
            });
        }
        return result;
    }

    async approvePlan(id) {
        const plan = await repository.getByIdAsync(id);
        if (!plan) throw new Error(`No plan found with ID ${id}`);
        
        plan.approvePlan(); // Domain method
        await repository.saveChangesAsync(plan);
    }

    async rejectPlan(id) {
        const plan = await repository.getByIdAsync(id);
        if (!plan) throw new Error(`No plan found with ID ${id}`);
        
        if (plan.status !== OperationPlanStatus.Draft) {
            throw new Error("Only draft plans can be rejected.");
        }
        await repository.deleteAsync(plan);
    }
}

module.exports = new OperationPlanService();