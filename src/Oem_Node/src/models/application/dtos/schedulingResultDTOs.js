class SchedulingResultDTO {
    constructor(data) {
        this.heuristicName = data.heuristicName;
        this.totalDelayMinutes = data.totalDelayMinutes || 0;
        this.runtimeSeconds = data.runtimeSeconds || 0;
        this.entries = (data.entries || []).map(entry => new VesselScheduleEntryDTO(entry));
        this.warnings = data.warnings || [];
    }
}

class VesselScheduleEntryDTO {
    constructor(data) {
        this.vesselVisitId = data.vesselVisitId;
        this.vesselIMO = data.vesselIMO;
        this.startTime = data.startTime;
        this.endTime = data.endTime;
        this.assignedCraneId = data.assignedCraneId;
        this.numberOfCranes = data.numberOfCranes || 1;
        this.staffMecNumbers = data.staffMecNumbers || [];
        this.delayMinutes = data.delayMinutes || 0;
    }
}

class ResourceUtilizationDTO {
    constructor(data) {
        this.resourceName = data.resourceName || '';
        this.totalAllocatedMinutes = data.totalAllocatedMinutes || 0;
        this.totalOperations = data.totalOperations || 0;
    }
}

module.exports = {
    SchedulingResultDTO,
    VesselScheduleEntryDTO,
    ResourceUtilizationDTO
};