const ComplementaryTask = require('../../domain/complementaryTasks/complementaryTask');
const ComplementaryTaskCategory = require('../../domain/complementaryTasks/complementaryTaskCategory');

class ComplementaryTaskRepository {

    // --- CATEGORIES (US 4.1.14) ---

    async createCategoryAsync(data) {
        const category = new ComplementaryTaskCategory(data);
        return await category.save();
    }

    async getAllCategoriesAsync() {
        return await ComplementaryTaskCategory.find().sort({ name: 1 });
    }

    async getCategoryByIdAsync(id) {
        return await ComplementaryTaskCategory.findById(id);
    }

    async updateCategoryAsync(id, data) {
        // { new: true } returns the modified document rather than the original
        return await ComplementaryTaskCategory.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteCategoryAsync(id) {
        return await ComplementaryTaskCategory.findByIdAndDelete(id);
    }

    // --- TASKS (US 4.1.15) ---

    async createTaskAsync(data) {
        const task = new ComplementaryTask(data);
        return await task.save();
    }

    async getTaskByIdAsync(id) {
        // We ALWAYS populate the category to display the Code/Name in the UI
        return await ComplementaryTask.findById(id)
            .populate('complementaryTaskCategoryId');
    }

    async findTasksAsync(query) {
        return await ComplementaryTask.find(query)
            .populate('complementaryTaskCategoryId')
            .sort({ startTime: -1 }); // Default sort: Newest first
    }

    async updateTaskAsync(id, data) {
        return await ComplementaryTask.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteTaskAsync(id) {
        return await ComplementaryTask.findByIdAndDelete(id);
    }
}

module.exports = new ComplementaryTaskRepository();