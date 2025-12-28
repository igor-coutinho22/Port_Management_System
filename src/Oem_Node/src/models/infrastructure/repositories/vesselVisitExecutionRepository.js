const VesselVisitExecution = require('../../domain/vesselVisitExecutions/vesselVisitExecution');

class VesselVisitExecutionRepository {

    // Matches: public async Task AddAsync(VesselVisitExecution vesselVisitExecution)
    async addAsync(vesselVisitExecution) {
        // In Mongoose, the 'vesselVisitExecution' passed here is a Model instance created 
        // in the Service/Mapper. Calling .save() persists it to MongoDB.
        await vesselVisitExecution.save();
    }

    // Matches: public async Task<VesselVisitExecution?> GetByIdAsync(Guid id)
    async getByIdAsync(id) {
        // Finds the document by its _id field
        return await VesselVisitExecution.findById(id);
    }

    // Matches: public async Task<IEnumerable<VesselVisitExecution>> GetAllAsync()
    async getAllAsync() {
        // Returns all documents in the collection
        return await VesselVisitExecution.find();
    }

    // Matches: public async Task DeleteAsync(VesselVisitExecution vesselVisitExecution)
    async deleteAsync(vesselVisitExecution) {
        // In Mongoose, document instances have a helper method .deleteOne() 
        // which removes that specific document from the DB.
        if (vesselVisitExecution) {
            await vesselVisitExecution.deleteOne();
        }
    }
}

module.exports = new VesselVisitExecutionRepository();