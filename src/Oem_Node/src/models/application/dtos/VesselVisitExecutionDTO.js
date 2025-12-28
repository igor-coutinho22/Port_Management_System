class VesselVisitExecutionDTO {
    constructor(data) {
        this.id = data.id || data._id; // Handle Mongoose _id
        this.vesselVisitId = data.vesselVisitId;
        this.vesselIMO = data.vesselIMO || '';
        this.actualArrivalTime = data.actualArrivalTime;
        this.status = data.status || '';
        this.createdBy = data.createdBy || '';
        this.createdAt = data.createdAt;

        this.berthTime = data.berthTime;
        this.dockId = data.dockId;
        this.discrepancy = data.discrepancy;
        this.auditLog = data.auditLog;
    }
}

module.exports = VesselVisitExecutionDTO;