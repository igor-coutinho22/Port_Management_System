const repository = require('../../infrastructure/repositories/incidentRepository');
const Mapper = require('../mappers/IncidentMapper');
const VesselVisitExecution = require('../../domain/vesselVisitExecutions/vesselVisitExecution');

class IncidentService {

    // =========================================================
    // SECTION 1: INCIDENT TYPES (US 4.1.12)
    // =========================================================

    async getAllTypes() {
        const types = await repository.getAllTypesAsync();
        return types.map(t => Mapper.toTypeDTO(t));
    }

    async getTypeById(id) {
        const type = await repository.getTypeByIdAsync(id);
        return Mapper.toTypeDTO(type);
    }

    async createType(data) {
        if (!data.code || !data.name) throw new Error("Code and Name are required.");

        // --- STRICT CODE VALIDATION ---
        const normalizedCode = data.code.toUpperCase().trim();
        // Regex: 3-20 chars, Uppercase, Numbers, Hyphens, Underscores
        const codeRegex = /^[A-Z0-9_-]{3,20}$/;

        if (!codeRegex.test(normalizedCode)) {
            throw new Error("Invalid Code Format. Code must be 3-20 characters, uppercase alphanumeric, with hyphens or underscores only (e.g., 'ENV-01').");
        }

        data.code = normalizedCode;
        // ------------------------------

        const created = await repository.createTypeAsync(data);
        return Mapper.toTypeDTO(created);
    }

    async updateType(id, data) {
        // --- IMMUTABLE CODE CHECK ---
        if (data.code) {
            throw new Error("Invalid Operation: Incident Type Code cannot be changed once created.");
        }

        const updated = await repository.updateTypeAsync(id, data);
        if (!updated) return null;
        return Mapper.toTypeDTO(updated);
    }

    async deleteType(id) {
        return await repository.deleteTypeAsync(id);
    }

    async getTypeById(id) {
        const type = await repository.getTypeByIdAsync(id);
        return Mapper.toTypeDTO(type);
    }


    // =========================================================
    // SECTION 2: INCIDENTS (US 4.1.13)
    // =========================================================

    async createIncident(data, user) {
        if (!data.startTime) throw new Error("StartTime is required.");
        if (!data.incidentTypeId) throw new Error("Incident Type is required.");

        // 1. Prepare Data
        const incidentData = {
            ...data,
            createdBy: user && user.name ? user.name : 'System',
            status: 'Active'
        };

        // 2. Save
        const created = await repository.createIncidentAsync(incidentData);

        // 3. Return DTO (Fetch again to populate the Type Name for display)
        const populated = await repository.getIncidentByIdAsync(created._id);
        return Mapper.toIncidentDTO(populated);
    }

    async updateIncident(id, data, user) {
        // Business Rule: If Resolved, ensure EndTime exists
        if (data.status === 'Resolved' && !data.endTime) {
            data.endTime = new Date();
        }

        // Business Rule: If Re-opening, clear EndTime
        if (data.status === 'Active') {
            data.endTime = null;
        }

        const updated = await repository.updateIncidentAsync(id, data);
        if (!updated) return null;
        return Mapper.toIncidentDTO(updated);
    }

    async getIncidentById(id) {
        const result = await repository.getIncidentByIdAsync(id);
        if (!result) return null;
        return Mapper.toIncidentDTO(result);
    }

    async deleteIncident(id) {
        return await repository.deleteIncidentAsync(id);
    }

    // =========================================================
    // SECTION 3: ADVANCED SEARCH LOGIC
    // =========================================================

    async searchIncidents(filters) {
        const query = {};

        // 1. Date Range
        if (filters.start || filters.end) {
            query.startTime = {};
            if (filters.start) query.startTime.$gte = new Date(filters.start);
            if (filters.end) query.startTime.$lte = new Date(filters.end);
        }

        // 2. Status & Severity
        if (filters.status && filters.status !== 'All') {
            query.status = filters.status;
        }
        if (filters.severity && filters.severity !== 'All') {
            query.severity = filters.severity;
        }

        // 3. Vessel Search (The Complex Part)
        if (filters.vessel) {
            const term = filters.vessel.trim();

            // Find VVEs matching the term
            const matchingVVEs = await VesselVisitExecution.find({
                $or: [
                    { vesselIMO: term },
                    { vesselVisitId: term }
                ]
            }).select('_id');

            const vveIds = matchingVVEs.map(v => v._id.toString());

            // Add to query: Incident must affect one of these VVEs
            query.affectedVesselVisitIds = { $in: vveIds };
        }

        // 4. Call Repository
        const rawResults = await repository.findIncidentsAsync(query);

        // 5. Map to DTOs
        return rawResults.map(r => Mapper.toIncidentDTO(r));
    }
}

module.exports = new IncidentService();