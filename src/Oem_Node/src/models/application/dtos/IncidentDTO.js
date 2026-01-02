class IncidentDTO {
    constructor(data) {
        this.id = data._id || data.id;
        this.type = data.incidentTypeId;
        this.description = data.description;
        this.startTime = data.startTime;
        this.endTime = data.endTime;
        this.status = data.status;
        this.severity = data.severity;
        this.scope = data.scope;
        this.affectedVesselVisitIds = data.affectedVesselVisitIds;
        this.createdBy = data.createdBy;
        
        this.durationMinutes = null;
    }
}
module.exports = IncidentDTO;