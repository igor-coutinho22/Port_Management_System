const repository = require('../../infrastructure/repositories/vesselVisitExecutionRepository');

class VesselVisitExecutionService {

    // Matches: public async Task CreateVesselVisitExecutionAsync(VesselVisitExecution vesselVisitExecution)
    async createVesselVisitExecution(vesselVisitExecution) {
        if (!vesselVisitExecution) {
            throw new Error('ArgumentNullException: vesselVisitExecution cannot be null.');
        }

        // Check if ID already exists
        // Note: Mongoose uses _id, but our mapper/logic treats it as 'id' or '_id'. 
        // We access _id directly from the domain entity.
        const existingEntity = await repository.getByIdAsync(vesselVisitExecution._id);
        
        if (existingEntity) {
            throw new Error('InvalidOperationException: A Vessel Visit Execution with the same ID already exists.');
        }

        await repository.addAsync(vesselVisitExecution);
        return vesselVisitExecution;
    }

    // Matches: public async Task<VesselVisitExecution?> GetVesselVisitExecutionByIdAsync(Guid id)
    async getVesselVisitExecutionById(id) {
        if (!id) {
            throw new Error('ArgumentException: Invalid ID.');
        }

        return await repository.getByIdAsync(id);
    }

    // Matches: public async Task<IEnumerable<VesselVisitExecution>> GetAllVesselVisitExecutionsAsync()
    async getAllVesselVisitExecutions() {
        return await repository.getAllAsync();
    }

    // Matches: public async Task DeleteVesselVisitExecutionAsync(Guid id)
    async deleteVesselVisitExecution(id) {
        if (!id) {
            throw new Error('ArgumentException: Invalid ID.');
        }

        const vvnToDelete = await repository.getByIdAsync(id);
        
        if (!vvnToDelete) {
            throw new Error('InvalidOperationException: Vessel Visit Execution not found.');
        }

        await repository.deleteAsync(vvnToDelete);
    }
}

// Export as a Singleton (new instance) so we can use it immediately in the Controller
module.exports = new VesselVisitExecutionService();