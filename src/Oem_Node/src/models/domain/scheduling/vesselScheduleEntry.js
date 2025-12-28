class VesselScheduleEntry {
    constructor(data) {
        this.vesselVisitId = data.vesselVisitId;
        this.vesselIMO = data.vesselIMO || '';
        this.startTime = new Date(data.startTime);
        this.endTime = new Date(data.endTime);
        this.assignedCraneId = data.assignedCraneId || null;
        this.numberOfCranes = data.numberOfCranes || 1;
        this.staffMecNumbers = data.staffMecNumbers || [];
        this.delayMinutes = data.delayMinutes || 0;
    }
}

module.exports = VesselScheduleEntry;