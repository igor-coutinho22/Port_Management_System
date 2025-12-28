const OperationPlan = require('../../domain/operationPlans/operationPlan');

class OperationPlanRepository {

    async getByIdAsync(id) {
        // Mongoose automatically retrieves embedded 'items' and 'auditLog'
        return await OperationPlan.findById(id);
    }

    async getAllAsync() {
        return await OperationPlan.find();
    }

    async addAsync(plan) {
        await plan.save();
    }

    async saveChangesAsync(plan) {
        if (plan) {
            await plan.save();
        }
    }

    async updateAsync(plan) {
        if (plan) {
            await plan.save();
        }
    }

    async deleteAsync(plan) {
        if (plan) {
            await plan.deleteOne();
        }
    }

    async searchPlansAsync(startDate, endDate, vesselIMO) {
        const query = {};

        // --- Date Logic  ---
        
        // Helper to get start/end of a specific day
        const getDayRange = (dateStr) => {
            const start = new Date(dateStr);
            start.setHours(0, 0, 0, 0);
            const end = new Date(dateStr);
            end.setHours(23, 59, 59, 999);
            return { start, end };
        };

        if (startDate && !endDate) {
            // Logic: Exact match on StartDate
            const { start, end } = getDayRange(startDate);
            query.scheduleDate = { $gte: start, $lte: end };
        } 
        else if (startDate && endDate) {
            // Logic: Range [Start, End]
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query.scheduleDate = { $gte: start, $lte: end };
        } 
        else if (!startDate && endDate) {
            // Logic: Exact match on EndDate
            const { start, end } = getDayRange(endDate);
            query.scheduleDate = { $gte: start, $lte: end };
        }

        // --- VesselIMO Logic ---
        if (vesselIMO) {
            query['items.vesselIMO'] = { $regex: vesselIMO, $options: 'i' };
        }

        return await OperationPlan.find(query).sort({ scheduleDate: -1 });
    }
}

module.exports = new OperationPlanRepository();