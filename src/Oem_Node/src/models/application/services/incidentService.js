const repository = require('../../infrastructure/repositories/incidentRepository');

class IncidentService {
    // --- Types ---
    async createType(data) {
        if (!data.code || !data.name) throw new Error("Code and Name are required.");
        return await repository.createTypeAsync(data);
    }
    async getAllTypes() {
        return await repository.getAllTypesAsync();
    }
    async getTypeById(id) {
        return await repository.getTypeByIdAsync(id);
    }
    async updateType(id, data) {
        return await repository.updateTypeAsync(id, data);
    }
    async deleteType(id) {
        return await repository.deleteTypeAsync(id);
    }

    // --- Incidents (Core) ---
    async createIncident(data) {
        // Validate dates
        if (!data.startTime) throw new Error("StartTime is required.");

        return await repository.createIncidentAsync(data);
    }

    async getIncidentById(id) {
        return await repository.getIncidentByIdAsync(id);
    }

    async updateIncident(id, data) {
        // Business Rule: If status 'Resolved', ensure endTime is set
        if (data.status === 'Resolved' && !data.endTime) {
            data.endTime = new Date();
        }
        return await repository.updateIncidentAsync(id, data);
    }

    async deleteIncident(id) {
        return await repository.deleteIncidentAsync(id);
    }

    // --- Search Logic ---
    async searchIncidents(filters) {
        // filters: { start, end, status, severity, vesselName (optional) }

        const query = {};

        // 1. Date Range
        if (filters.start || filters.end) {
            query.startTime = {};
            if (filters.start) query.startTime.$gte = new Date(filters.start);
            if (filters.end) query.startTime.$lte = new Date(filters.end);
        }

        // 2. Status & Severity
        if (filters.status) query.status = filters.status;
        if (filters.severity) query.severity = filters.severity;

        // 3. Vessel Name Filter
        // Since we are in Node with Mongoose population, we can't easily filter the PARENT (Incident) by a property of the CHILD (VVE.vesselName) in a standard find().
        // We have two options:
        // A) Find VVEs first matching criteria, then find Incidents linking to those IDs.
        // B) Use Aggregation Lookup.
        // A is simpler and consistent with previous logic.

        if (filters.vessel) {
            const VVE = require('../../domain/vesselVisitExecutions/vesselVisitExecution');
            const matchingVVEs = await VVE.find({
                $or: [
                    { vesselIMO: filters.vessel },
                    { vesselName: new RegExp(filters.vessel, 'i') }, // Assuming VVE has vesselName stored or we check IMO
                    { vesselVisitId: filters.vessel } // Functional ID check
                ]
            }).select('_id');

            const vveIds = matchingVVEs.map(v => v._id);

            // Filter Incidents that have ANY of these IDs in affectedVesselVisitIds
            query.affectedVesselVisitIds = { $in: vveIds };
        }

        return await repository.findIncidentsAsync(query);
    }
}

module.exports = new IncidentService();
