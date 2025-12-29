class VesselVisitExecutionDTO {
    constructor(data) {
        this.id = data.id || data._id;
        this.vesselVisitId = data.vesselVisitId;
        this.vesselIMO = data.vesselIMO || '';
        this.actualArrivalTime = data.actualArrivalTime;
        this.status = data.status || '';
        this.createdBy = data.createdBy || '';
        this.createdAt = data.createdAt;
        this.completedTime = data.completedTime;

        this.berthTime = data.berthTime;
        this.dockId = data.dockId;
        this.discrepancy = data.discrepancy;
        this.auditLog = data.auditLog;

        this.executedOperations = data.executedOperations;
        this.metrics = data.metrics || {
            waitingTimeMinutes: 0,      // Arrival -> Berth
            berthOccupancyMinutes: 0,   // Berth -> Complete
            totalTurnaroundMinutes: 0   // Arrival -> Complete
        };
    }
}

module.exports = VesselVisitExecutionDTO;