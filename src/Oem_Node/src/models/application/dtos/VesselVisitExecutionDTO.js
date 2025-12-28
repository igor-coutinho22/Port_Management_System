class VesselVisitExecutionDTO {
    constructor(data) {
        this.id = data.id;
        this.vesselVisitId = data.vesselVisitId;
        this.vesselIMO = data.vesselIMO || '';
        this.actualArrivalTime = data.actualArrivalTime;
        this.createdBy = data.createdBy || '';
        this.createdAt = data.createdAt;
        this.status = data.status || '';
    }
}

module.exports = VesselVisitExecutionDTO;