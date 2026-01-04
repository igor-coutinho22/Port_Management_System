const repository = require('../../infrastructure/repositories/complementaryTaskRepository');
const Mapper = require('../../application/mappers/complementaryTaskMapper');
const VesselVisitExecution = require('../../domain/vesselVisitExecutions/vesselVisitExecution'); // For searching

class ComplementaryTaskService {

    // --- Categories (US 4.1.14) ---

    async createCategory(data) {
        // Code is immutable in updates, but required in create
        if (!data.code || !data.name) throw new Error("Code and Name are required.");
        
        const category = await repository.createCategoryAsync(data);
        return Mapper.toCategoryDTO(category);
    }

    async getAllCategories() {
        const categories = await repository.getAllCategoriesAsync();
        return categories.map(c => Mapper.toCategoryDTO(c));
    }

    async getCategoryById(id) {
        const category = await repository.getCategoryByIdAsync(id);
        if (!category) return null;
        return Mapper.toCategoryDTO(category);
    }

    async updateCategory(id, data) {
        // Prevent Code updates (Immutability rule)
        if (data.code) delete data.code; 

        const updated = await repository.updateCategoryAsync(id, data);
        if (!updated) return null;
        return Mapper.toCategoryDTO(updated);
    }

    async deleteCategory(id) {
        return await repository.deleteCategoryAsync(id);
    }

    // --- Tasks (US 4.1.15) ---

    async createTask(data) {
        // Basic Validation
        if (!data.complementaryTaskCategoryId) throw new Error("Category ID is required.");
        if (!data.responsibleTeam) throw new Error("Responsible Team is required.");
        if (!data.startTime) throw new Error("Start Time is required.");
        if (!data.vesselVisitExecutionId) throw new Error("Vessel Visit Execution ID is required.");

        const task = await repository.createTaskAsync(data);
        // We fetch it back to populate the category for the DTO
        const populatedTask = await repository.getTaskByIdAsync(task._id);
        return Mapper.toTaskDTO(populatedTask);
    }

    async getTaskById(id) {
        const task = await repository.getTaskByIdAsync(id);
        if (!task) return null;
        return Mapper.toTaskDTO(task);
    }

    async updateTask(id, data) {
        // Business Rule: If marking as Completed, ensure EndTime is set
        if (data.status === 'Completed' && !data.endTime) {
            data.endTime = new Date(); // Default to Now
        }
        
        // Business Rule: If reverting to Ongoing, clear EndTime
        if (data.status === 'Ongoing') {
            data.endTime = null;
        }

        const updated = await repository.updateTaskAsync(id, data);
        if (!updated) return null;
        
        // Return populated DTO
        const populated = await repository.getTaskByIdAsync(updated._id);
        return Mapper.toTaskDTO(populated);
    }

    async deleteTask(id) {
        return await repository.deleteTaskAsync(id);
    }

    // --- Search Logic ---
    async searchTasks(filters) {
        const query = {};

        // 1. Date Range
        if (filters.start || filters.end) {
            query.startTime = {};
            if (filters.start) query.startTime.$gte = new Date(filters.start);
            if (filters.end) query.startTime.$lte = new Date(filters.end);
        }

        // 2. Direct Filters
        if (filters.status && filters.status !== 'All') query.status = filters.status;
        if (filters.vesselVisitId) query.vesselVisitExecutionId = filters.vesselVisitId;

        // 3. Complex Filter: Search by Vessel Name or IMO
        if (filters.vessel) {
            // Find VVEs that match this vessel name/IMO
            const matchingVVEs = await VesselVisitExecution.find({
                $or: [
                    { vesselIMO: filters.vessel },
                    { vesselName: new RegExp(filters.vessel, 'i') } // Case-insensitive
                ]
            }).select('_id');

            // Add the VVE IDs to the query
            const vveIds = matchingVVEs.map(v => v._id.toString());
            
            // If we already had a visitId filter, we must intersect or overwrite. 
            // Usually, user filters by EITHER Visit ID OR Vessel Name. 
            // We'll use $in
            query.vesselVisitExecutionId = { $in: vveIds };
        }

        const tasks = await repository.findTasksAsync(query);
        return tasks.map(t => Mapper.toTaskDTO(t));
    }
}

module.exports = new ComplementaryTaskService();