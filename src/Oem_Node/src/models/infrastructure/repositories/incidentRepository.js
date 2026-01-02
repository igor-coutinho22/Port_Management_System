const Incident = require('../../domain/incidents/incident');
const IncidentType = require('../../domain/incidents/incidentType');

class IncidentRepository {

    // --- Types ---
    async createTypeAsync(data) {
        const type = new IncidentType(data);
        return await type.save();
    }

    async getAllTypesAsync() {
        return await IncidentType.find();
    }

    async getTypeByIdAsync(id) {
        return await IncidentType.findById(id);
    }

    async updateTypeAsync(id, data) {
        return await IncidentType.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteTypeAsync(id) {
        return await IncidentType.findByIdAndDelete(id);
    }

    // --- Incidents ---
    async createIncidentAsync(data) {
        const incident = new Incident(data);
        return await incident.save();
    }

    async getIncidentByIdAsync(id) {
        return await Incident.findById(id)
            .populate('incidentTypeId', 'name code')
            .populate('affectedVesselVisitIds', 'vesselName vesselVisitId');
    }

    /**
     * Advanced Search
     * @param {Object} query - Mongoose filter object
     */
    async findIncidentsAsync(query) {
        return await Incident.find(query)
            .populate('incidentTypeId', 'name code')
            .populate('affectedVesselVisitIds', 'vesselName vesselVisitId');
    }

    async updateIncidentAsync(id, data) {
        return await Incident.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteIncidentAsync(id) {
        return await Incident.findByIdAndDelete(id);
    }
}

module.exports = new IncidentRepository();
