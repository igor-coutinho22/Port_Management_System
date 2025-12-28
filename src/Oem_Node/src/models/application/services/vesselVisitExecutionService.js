const repository = require('../../infrastructure/repositories/vesselVisitExecutionRepository');

class VesselVisitExecutionService {

    // Matches Controller: service.createVesselVisitExecution(domainEntity)
    async createVesselVisitExecution(domainEntity) {
        if (!domainEntity) {
            throw new Error('ArgumentNullException: Domain entity cannot be null.');
        }

        // Check if execution already exists for this Visit ID
        const existing = await repository.getByVesselVisitIdAsync(domainEntity.vesselVisitId);
        if (existing) {
            throw new Error(`InvalidOperationException: Execution already started for Visit ID ${domainEntity.vesselVisitId}`);
        }

        await repository.addAsync(domainEntity);
        return domainEntity;
    }

    // Matches Controller: service.getVesselVisitExecutionById(id)
    async getVesselVisitExecutionById(id) {
        if (!id) throw new Error('ArgumentException: Invalid ID.');
        return await repository.getByIdAsync(id);
    }

    // Matches Controller: service.getAllVesselVisitExecutionsAsync()
    async getAllVesselVisitExecutionsAsync() {
        return await repository.getAllAsync();
    }

    async deleteVesselVisitExecution(id) {
        if (!id) throw new Error('ArgumentException: Invalid ID.');
        
        const entity = await repository.getByIdAsync(id);
        if (!entity) {
            throw new Error('InvalidOperationException: Vessel Visit Execution not found.');
        }

        await repository.deleteAsync(entity);
    }
}

module.exports = new VesselVisitExecutionService();