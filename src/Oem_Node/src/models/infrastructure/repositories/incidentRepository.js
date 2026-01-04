const Incident = require('../../domain/incidents/incident');
const IncidentType = require('../../domain/incidents/incidentType');

// IMPORTANT: We require this here to ensure the model is registered with Mongoose 
// before we try to populate it. Even if unused directly, it prevents "MissingSchemaError".
require('../../domain/vesselVisitExecutions/vesselVisitExecution');

class IncidentRepository {

    // =========================================================
    // SECTION 1: INCIDENT TYPES
    // =========================================================

    async createTypeAsync(data) {
        const type = new IncidentType(data);
        return await type.save();
    }

    async getAllTypesAsync() {
        return await IncidentType.find().sort({ code: 1 }); // Sorted by Code usually looks best
    }

    async getTypeByIdAsync(id) {
        return await IncidentType.findById(id);
    }

    async getTypeByIdAsync(id) {
        return await IncidentType.findById(id);
    }

    async updateTypeAsync(id, data) {
        // { new: true } returns the updated document instead of the old one
        return await IncidentType.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteTypeAsync(id) {
        return await IncidentType.findByIdAndDelete(id);
    }

    // =========================================================
    // SECTION 2: INCIDENTS
    // =========================================================

    async createIncidentAsync(data) {
        const incident = new Incident(data);
        return await incident.save();
    }

    async getIncidentByIdAsync(id) {
        return await Incident.findById(id)
            .populate('incidentTypeId', 'name code severity') // Get Type details
            .populate('affectedVesselVisitIds', 'vesselName vesselIMO vesselVisitId'); // Get Vessel details
    }

    /**
     * Advanced Search with Filters
     * @param {Object} query - The Mongoose query object built by the Service
     */
    async findIncidentsAsync(query) {
        return await Incident.find(query)
            .sort({ startTime: -1 }) // Show newest incidents first
            .populate('incidentTypeId', 'name code severity')
            .populate('affectedVesselVisitIds', 'vesselName vesselIMO vesselVisitId');
    }

    async updateIncidentAsync(id, data) {
        return await Incident.findByIdAndUpdate(id, data, { new: true })
            .populate('incidentTypeId', 'name code severity')
            .populate('affectedVesselVisitIds', 'vesselName vesselIMO vesselVisitId');
    }

    async deleteIncidentAsync(id) {
        return await Incident.findByIdAndDelete(id);
    }
}

module.exports = new IncidentRepository();