const repository = require('../../infrastructure/repositories/vesselVisitExecutionRepository');
const webAppService = require('../../infrastructure/integration/webAppService');
const operationPlanRepository = require('../../infrastructure/repositories/operationPlanRepository');

class VesselVisitExecutionService {

    // --- HELPER: Discrepancy Logic ---
    async _checkDiscrepancy(vesselVisitId, actualDockId, arrivalDate, token) {
        if (!actualDockId) return null;

        let plannedDockId = null;

        // 1. Check Operation Plans
        if (arrivalDate) {
            const dateStr = arrivalDate.toISOString().split('T')[0];
            const plans = await operationPlanRepository.searchPlansAsync(dateStr, null, null);
            const approvedPlan = plans.find(p => p.status === 'Approved');

            if (approvedPlan && approvedPlan.items) {
                const planItem = approvedPlan.items.find(i => i.vesselVisitId === vesselVisitId);
                if (planItem && planItem.dockId) plannedDockId = planItem.dockId;
            }
        }

        // 2. Fallback to VVN
        if (!plannedDockId) {
            const vvn = await webAppService.getVesselVisitById(vesselVisitId, token);
            if (vvn && vvn.dockId) plannedDockId = vvn.dockId;
        }

        // 3. Compare
        const actual = actualDockId.toLowerCase();
        const planned = plannedDockId ? plannedDockId.toLowerCase() : null;

        if (actual && planned && actual !== planned) {
            return `Warning: Assigned Dock (${actualDockId}) differs from Planned Dock (${plannedDockId}).`;
        }

        return null;
    }

    // --- CREATE ---
    async createVesselVisitExecution(domainEntity, token) {
        if (!domainEntity) throw new Error('ArgumentNullException: Domain entity cannot be null.');

        const existing = await repository.getByVesselVisitIdAsync(domainEntity.vesselVisitId);
        if (existing) throw new Error(`InvalidOperationException: Execution already started for Visit ID ${domainEntity.vesselVisitId}`);

        let logDetails = 'Initial VVE creation';

        // Check dock validity if provided
        if (domainEntity.dockId) {
            const isValidDock = await webAppService.isDockValid(domainEntity.dockId, token);
            if (!isValidDock) throw new Error(`ArgumentException: Dock with ID '${domainEntity.dockId}' does not exist.`);

            const discrepancy = await this._checkDiscrepancy(
                domainEntity.vesselVisitId,
                domainEntity.dockId,
                domainEntity.actualArrivalTime,
                token
            );

            if (discrepancy) logDetails += `. ${discrepancy}`;
            // Attach for immediate feedback
            domainEntity.latestDiscrepancy = discrepancy;
        }

        domainEntity.auditLog = [{
            timestamp: new Date(),
            author: domainEntity.createdBy || 'System',
            action: 'Created',
            details: logDetails
        }];

        await repository.addAsync(domainEntity);
        return domainEntity;
    }

    // --- UPDATE ---
    async updateVesselVisitExecution(id, updateDto, token) {
        if (!id) throw new Error('ArgumentException: Invalid ID.');

        const execution = await repository.getByIdAsync(id);
        if (!execution) throw new Error('KeyNotFoundException: Vessel Visit Execution not found.');

        // [US 4.1.11] Read-Only Check
        if (execution.status === 'Completed' && !updateDto.isAdminOverride) {
            throw new Error('InvalidOperationException: Cannot update a completed Vessel Visit Execution.');
        }

        let changesLogged = [];

        // --- PART A: Handle Berth/Dock Updates (US 4.1.8) ---
        if (updateDto.dockId !== undefined || updateDto.berthTime !== undefined) {

            // 1. Validate Dock if changing
            if (updateDto.dockId) {
                const isValidDock = await webAppService.isDockValid(updateDto.dockId, token);
                if (!isValidDock) throw new Error(`ArgumentException: Dock '${updateDto.dockId}' does not exist.`);
            }

            // 2. Discrepancy Check
            const dockToCheck = updateDto.dockId !== undefined ? updateDto.dockId : execution.dockId;
            const discrepancy = await this._checkDiscrepancy(
                execution.vesselVisitId,
                dockToCheck,
                execution.actualArrivalTime,
                token
            );

            // Attach for immediate feedback
            execution.latestDiscrepancy = discrepancy;

            // 3. Apply Values
            if (updateDto.berthTime) execution.berthTime = new Date(updateDto.berthTime);
            if (updateDto.dockId !== undefined) execution.dockId = updateDto.dockId;

            changesLogged.push(`Header Update (Dock/Berth). ${discrepancy || ''}`);
        }

        // --- PART B: Handle Operation Updates (US 4.1.9) ---
        if (updateDto.operationId) {

            // Find or Create the Operation entry in the array
            let op = execution.executedOperations.find(o => o.operationId === updateDto.operationId);

            if (!op) {
                op = {
                    operationId: updateDto.operationId,
                    type: updateDto.operationType,
                    resourcesUsed: { staff: 0, cranes: 0 },
                    status: 'Pending'
                };
                execution.executedOperations.push(op);
                // Re-fetch reference
                op = execution.executedOperations.find(o => o.operationId === updateDto.operationId);
            }

            // Apply Values
            if (updateDto.operationStatus) op.status = updateDto.operationStatus;
            if (updateDto.actualStartTime) op.actualStartTime = new Date(updateDto.actualStartTime);
            if (updateDto.actualEndTime) op.actualEndTime = new Date(updateDto.actualEndTime);

            if (updateDto.staff !== undefined) op.resourcesUsed.staff = updateDto.staff;
            if (updateDto.cranes !== undefined) op.resourcesUsed.cranes = updateDto.cranes;

            op.updatedAt = new Date();

            changesLogged.push(`Operation ${op.type} (${updateDto.operationStatus})`);
        }

        // --- PART C: Save & Log ---
        if (changesLogged.length > 0) {
            execution.auditLog.push({
                timestamp: new Date(),
                author: updateDto.author,
                action: 'Update',
                details: changesLogged.join('; ')
            });
            await repository.updateAsync(execution);
        }

        return execution;
    }

    // --- COMPLETE (US 4.1.11) ---
    async completeVesselVisitExecution(id, completionData, token) {
        if (!id) throw new Error('ArgumentException: Invalid ID.');

        const execution = await repository.getByIdAsync(id);
        if (!execution) throw new Error('KeyNotFoundException: Vessel Visit Execution not found.');

        if (execution.status === 'Completed') {
            throw new Error('InvalidOperationException: VVE is already completed.');
        }

        // 1. Validate All Operations Finished
        // We check if there are any operations in the 'executedOperations' list that are NOT Completed
        if (execution.executedOperations && execution.executedOperations.length > 0) {
            const pendingOps = execution.executedOperations.filter(op => op.status !== 'Completed');
            if (pendingOps.length > 0) {
                throw new Error(`InvalidOperationException: Cannot complete VVE. There are ${pendingOps.length} unfinished operations.`);
            }
        }

        // 2. Apply Completion Data
        // completionData = { unberthTime, portDepartureTime, author }
        if (!completionData.unberthTime) throw new Error('ArgumentException: Actual Unberth Time is required.');
        if (!completionData.portDepartureTime) throw new Error('ArgumentException: Actual Port Departure Time is required.');

        execution.actualUnberthTime = new Date(completionData.unberthTime);
        execution.actualPortDepartureTime = new Date(completionData.portDepartureTime);

        execution.status = 'Completed';
        execution.completedAt = new Date();

        // 3. Log
        execution.auditLog.push({
            timestamp: new Date(),
            author: completionData.author || 'System',
            action: 'Completed',
            details: `VVE Completed. Unberth: ${completionData.unberthTime}, Departure: ${completionData.portDepartureTime}`
        });

        await repository.updateAsync(execution);
        return execution;
    }

    // --- UPDATED METHOD: Robust Property Casing Check ---
    async getPlannedOperations(vveId) {
        const execution = await repository.getByIdAsync(vveId);
        if (!execution) throw new Error('VVE not found');

        // 1. Determine target dates (Arrival, Previous, Next)
        const arrivalDate = new Date(execution.actualArrivalTime);
        const datesToCheck = [
            new Date(arrivalDate),
            new Date(arrivalDate),
            new Date(arrivalDate)
        ];
        datesToCheck[1].setDate(arrivalDate.getDate() - 1);
        datesToCheck[2].setDate(arrivalDate.getDate() + 1);

        let foundPlan = null;
        const targetVisitId = execution.vesselVisitId;

        // 2. Search
        for (const date of datesToCheck) {
            const dateStr = date.toISOString().split('T')[0];
            const plans = await operationPlanRepository.searchPlansAsync(dateStr, null, null);

            // Find Approved
            const approvedPlan = plans.find(p => p.status === 'Approved');

            if (approvedPlan && approvedPlan.items) {
                // Check for match using BOTH camelCase and PascalCase
                const match = approvedPlan.items.some(i =>
                    (i.vesselVisitId === targetVisitId) || (i.VesselVisitId === targetVisitId)
                );

                if (match) {
                    foundPlan = approvedPlan;
                    break;
                }
            }
        }

        if (!foundPlan || !foundPlan.items) return [];

        // 3. Return Filtered Items (Mapping properties to standard camelCase for Frontend)
        const rawItems = foundPlan.items.filter(i =>
            (i.vesselVisitId === targetVisitId) || (i.VesselVisitId === targetVisitId)
        );

        // Map to ensure frontend always gets clean "id" and "type"
        return rawItems.map(i => ({
            id: i.itemId || i.ItemId || i.id, // Ensure we get the Operation/Item ID
            type: i.operationType || i.OperationType || 'Operation', // 'Loading'/'Unloading'
            // Add other plan details if needed
        }));
    }

    // --- GET BY ID ---
    // Controller calls: service.getVesselVisitExecutionById
    async getVesselVisitExecutionById(id) {
        if (!id) throw new Error('ArgumentException: Invalid ID.');
        return await repository.getByIdAsync(id);
    }

    // --- GET ALL ---
    // Controller calls: service.getAllVesselVisitExecutionsAsync
    async getAllVesselVisitExecutionsAsync() {
        return await repository.getAllAsync();
    }

    async searchVesselVisitExecutions(filters) {
        // filters = { start, end, vessel (IMO or ID), status }

        const query = {};

        // 1. Date Range (on Actual Arrival Time)
        if (filters.start || filters.end) {
            query.actualArrivalTime = {};
            if (filters.start) {
                const startDate = new Date(filters.start);
                startDate.setUTCHours(0, 0, 0, 0);
                query.actualArrivalTime.$gte = startDate;
            }

            if (filters.end) {
                const endDate = new Date(filters.end);
                endDate.setUTCHours(23, 59, 59, 999);
                query.actualArrivalTime.$lte = endDate;
            }
        }

        // 2. Vessel (Smart Match: IMO or Visit ID)
        if (filters.vessel) {
            const term = filters.vessel.trim();
            query.$or = [
                { vesselIMO: term },
                { vesselVisitId: term }
            ];
        }

        // 3. Status
        if (filters.status && filters.status !== 'All') {
            query.status = filters.status;
        }

        return await repository.findAsync(query);
    }

    // --- DELETE ---
    async deleteVesselVisitExecution(id) {
        if (!id) throw new Error('ArgumentException: Invalid ID.');
        const entity = await repository.getByIdAsync(id);
        if (!entity) throw new Error('InvalidOperationException: Vessel Visit Execution not found.');
        await repository.deleteAsync(entity);
    }
}

module.exports = new VesselVisitExecutionService();