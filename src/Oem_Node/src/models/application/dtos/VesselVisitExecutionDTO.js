class VesselVisitExecutionDTO {
    constructor(data) {
        this.id = data.id || data._id; // Handle Mongoose _id
        this.vesselVisitId = data.vesselVisitId;
        this.vesselIMO = data.vesselIMO || '';
        this.actualArrivalTime = data.actualArrivalTime;
        this.status = data.status || '';
        this.createdBy = data.createdBy || '';
        this.createdAt = data.createdAt;
    }
}

module.exports = VesselVisitExecutionDTO;