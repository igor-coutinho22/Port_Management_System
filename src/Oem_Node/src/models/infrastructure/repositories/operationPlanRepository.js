const OperationPlan = require('../../domain/operationPlans/operationPlan');

class OperationPlanRepository {

    // Matches: GetByIdAsync(Guid id)
    async getByIdAsync(id) {
        // Mongoose automatically retrieves embedded 'items' and 'auditLog'
        return await OperationPlan.findById(id);
    }

    // Matches: GetAllAsync()
    async getAllAsync() {
        return await OperationPlan.find();
    }

    // Matches: AddAsync(OperationPlan plan)
    async addAsync(plan) {
        await plan.save();
    }

    // Matches: SaveChangesAsync()
    // NOTE: In Node, we don't have a global Context tracker. 
    // The Service must pass the 'plan' instance here to save changes (like new Audit logs).
    async saveChangesAsync(plan) {
        if (plan) {
            await plan.save();
        }
    }

    // Matches: UpdateAsync(OperationPlan plan)
    async updateAsync(plan) {
        if (plan) {
            await plan.save();
        }
    }

    // Matches: DeleteAsync(OperationPlan plan)
    async deleteAsync(plan) {
        if (plan) {
            await plan.deleteOne();
        }
    }

    // Matches: SearchPlansAsync(...)
    async searchPlansAsync(startDate, endDate, vesselIMO) {
        const query = {};

        // --- Date Logic (Mirroring C# if/else structure) ---
        
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
            // Matches: p.Items.Any(i => i.VesselIMO.Contains(vesselIMO))
            // Mongoose allows querying arrays of objects directly.
            // We use $regex for "Contains" (case-insensitive option 'i' is safer in JS)
            query['items.vesselIMO'] = { $regex: vesselIMO, $options: 'i' };
        }

        return await OperationPlan.find(query).sort({ scheduleDate: -1 });
    }
}

module.exports = new OperationPlanRepository();