const ComplementaryTask = require('../../domain/complementaryTasks/complementaryTask');
const ComplementaryTaskCategory = require('../../domain/complementaryTasks/complementaryTaskCategory');

class ComplementaryTaskRepository {

    // --- Categories ---
    async createCategoryAsync(data) {
        const category = new ComplementaryTaskCategory(data);
        return await category.save();
    }

    async getAllCategoriesAsync() {
        return await ComplementaryTaskCategory.find();
    }

    async getCategoryByIdAsync(id) {
        return await ComplementaryTaskCategory.findById(id);
    }

    async updateCategoryAsync(id, data) {
        return await ComplementaryTaskCategory.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteCategoryAsync(id) {
        return await ComplementaryTaskCategory.findByIdAndDelete(id);
    }

    // --- Tasks ---
    async createTaskAsync(data) {
        const task = new ComplementaryTask(data);
        return await task.save();
    }

    async getTaskByIdAsync(id) {
        // Since we are referencing VVE by String ID (UUID) and Category by ObjectId
        // We populate the Category directly. VVE population might need virtuals or manual lookup if Mongoose 'ref' works with non-ObjectId refs (it can if types match, but usually assumes ObjectId).
        // VVE ID in VVE model is UUID string, here it is String. Mongoose population requires _id to match.
        // If VVE uses UUID string as _id, population works. If VVE uses ObjectId as _id but has a separate uuid field, we might not populate here easily without `localField` settings.
        // Assuming VVEs have String _ids based on checking other files (Incident references it too).

        return await ComplementaryTask.findById(id)
            .populate('complementaryTaskCategoryId');
    }

    async findTasksAsync(query) {
        return await ComplementaryTask.find(query)
            .populate('complementaryTaskCategoryId');
    }

    async updateTaskAsync(id, data) {
        return await ComplementaryTask.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteTaskAsync(id) {
        return await ComplementaryTask.findByIdAndDelete(id);
    }
}

module.exports = new ComplementaryTaskRepository();
