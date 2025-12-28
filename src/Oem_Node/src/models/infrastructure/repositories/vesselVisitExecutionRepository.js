const VesselVisitExecution = require('../../domain/vesselVisitExecutions/vesselVisitExecution');

class VesselVisitExecutionRepository {

    async addAsync(domainEntity) {
        await domainEntity.save();
    }

    // --- New Update Method ---
    async updateAsync(domainEntity) {
        // In Mongoose, saving a loaded document updates it. 
        // This is explicitly named for architectural consistency.
        await domainEntity.save();
    }

    async getByIdAsync(id) {
        return await VesselVisitExecution.findById(id);
    }

    // Helper to find by the functional ID (VVN ID), not just DB ID
    async getByVesselVisitIdAsync(vesselVisitId) {
        return await VesselVisitExecution.findOne({ vesselVisitId: vesselVisitId });
    }

    async getAllAsync() {
        // Sort by CreatedAt descending so newest appear top
        return await VesselVisitExecution.find().sort({ createdAt: -1 });
    }

    async deleteAsync(domainEntity) {
        if (domainEntity) {
            await domainEntity.deleteOne();
        }
    }
}

module.exports = new VesselVisitExecutionRepository();