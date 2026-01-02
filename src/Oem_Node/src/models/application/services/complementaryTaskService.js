const repository = require('../../infrastructure/repositories/complementaryTaskRepository');

class ComplementaryTaskService {

    // --- Categories ---
    async createCategory(data) {
        if (!data.code || !data.name) throw new Error("Code and Name are required.");
        return await repository.createCategoryAsync(data);
    }

    async getAllCategories() {
        return await repository.getAllCategoriesAsync();
    }

    async getCategoryById(id) {
        return await repository.getCategoryByIdAsync(id);
    }

    async updateCategory(id, data) {
        return await repository.updateCategoryAsync(id, data);
    }

    async deleteCategory(id) {
        return await repository.deleteCategoryAsync(id);
    }

    // --- Tasks ---
    async createTask(data) {
        // Validation
        if (!data.complementaryTaskCategoryId) throw new Error("Category ID is required.");
        if (!data.responsibleTeam) throw new Error("Responsible Team is required.");
        if (!data.startTime) throw new Error("StartTime is required.");
        if (!data.vesselVisitExecutionId) throw new Error("Vessel Visit Execution ID is required.");

        return await repository.createTaskAsync(data);
    }

    async getTaskById(id) {
        return await repository.getTaskByIdAsync(id);
    }

    async updateTask(id, data) {
        if (data.status === 'Completed' && !data.endTime) {
            data.endTime = new Date();
        }
        return await repository.updateTaskAsync(id, data);
    }

    async deleteTask(id) {
        return await repository.deleteTaskAsync(id);
    }

    // --- Search ---
    async searchTasks(filters) {
        // filters: { start, end, status, vesselVisitId }
        const query = {};

        if (filters.start || filters.end) {
            query.startTime = {};
            if (filters.start) query.startTime.$gte = new Date(filters.start);
            if (filters.end) query.startTime.$lte = new Date(filters.end);
        }

        if (filters.status) query.status = filters.status;
        if (filters.vesselVisitId) query.vesselVisitExecutionId = filters.vesselVisitId;

        // Search by Vessel Name/IMO (matches IncidentService logic)
        if (filters.vessel) {
            const VVE = require('../../domain/vesselVisitExecutions/vesselVisitExecution');
            const matchingVVEs = await VVE.find({
                $or: [
                    { vesselIMO: filters.vessel },
                    { vesselName: new RegExp(filters.vessel, 'i') },
                    { vesselVisitId: filters.vessel }
                ]
            }).select('_id');

            const vveIds = matchingVVEs.map(v => v._id);
            query.vesselVisitExecutionId = { $in: vveIds };
        }

        return await repository.findTasksAsync(query);
    }
}

module.exports = new ComplementaryTaskService();
