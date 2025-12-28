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
    async updateBerthAndDock(id, updateDto, token) {
        if (!id) throw new Error('ArgumentException: Invalid ID.');

        const execution = await repository.getByIdAsync(id);
        if (!execution) throw new Error('KeyNotFoundException: Vessel Visit Execution not found.');

        // Validate Dock
        if (updateDto.dockId) {
            const isValidDock = await webAppService.isDockValid(updateDto.dockId, token);
            if (!isValidDock) throw new Error(`ArgumentException: Dock '${updateDto.dockId}' does not exist.`);
        }

        // Calculate Discrepancy
        const dockToCheck = updateDto.dockId !== undefined ? updateDto.dockId : execution.dockId;
        const discrepancy = await this._checkDiscrepancy(
            execution.vesselVisitId,
            dockToCheck,
            execution.actualArrivalTime,
            token
        );

        // Apply Updates
        if (updateDto.berthTime) execution.berthTime = new Date(updateDto.berthTime);
        if (updateDto.dockId !== undefined) execution.dockId = updateDto.dockId;

        // Audit Log
        execution.auditLog.push({
            timestamp: new Date(),
            author: updateDto.author,
            action: 'UpdateBerthAndDock',
            details: `Updated Berth: ${updateDto.berthTime}, Dock: ${updateDto.dockId}. ${discrepancy || ''}`
        });

        await repository.updateAsync(execution);
        
        execution.latestDiscrepancy = discrepancy; 
        return execution;
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

    // --- DELETE ---
    async deleteVesselVisitExecution(id) {
        if (!id) throw new Error('ArgumentException: Invalid ID.');
        const entity = await repository.getByIdAsync(id);
        if (!entity) throw new Error('InvalidOperationException: Vessel Visit Execution not found.');
        await repository.deleteAsync(entity);
    }
}

module.exports = new VesselVisitExecutionService();