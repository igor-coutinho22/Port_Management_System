const CategoryDTO = require('../../application/dtos/complementaryTaskCategoryDTO');
const TaskDTO = require('../../application/dtos/complementaryTaskDTO');

class ComplementaryTaskMapper {
    
    // --- CATEGORY ---
    static toCategoryDTO(category) {
        if (!category) return null;
        return new CategoryDTO(
            category._id,
            category.code,
            category.name,
            category.description,
            category.defaultDuration,
            category.expectedImpact
        );
    }

    // --- TASK ---
    static toTaskDTO(task) {
        if (!task) return null;

        // Check if category is populated (is an object) or just an ID
        let categoryDTO = null;
        if (task.complementaryTaskCategoryId && task.complementaryTaskCategoryId.code) {
            categoryDTO = this.toCategoryDTO(task.complementaryTaskCategoryId);
        } else {
            // Fallback if not populated (rare, but safety first)
            categoryDTO = { id: task.complementaryTaskCategoryId }; 
        }

        return new TaskDTO(
            task._id,
            categoryDTO,
            task.responsibleTeam,
            task.startTime,
            task.endTime,
            task.status,
            task.durationMinutes, // Uses the Mongoose virtual
            task.vesselVisitExecutionId
        );
    }
}

module.exports = ComplementaryTaskMapper;