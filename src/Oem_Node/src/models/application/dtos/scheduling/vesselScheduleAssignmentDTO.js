class VesselScheduleAssignmentDTO {
    constructor({
        vesselVisitId,
        dockId,
        arrivalTime = null,
        departureTime = null
    } = {}) {
        this.vesselVisitId = vesselVisitId; // string (UUID)
        this.dockId = dockId; // string (UUID)
        this.arrivalTime = arrivalTime ? new Date(arrivalTime) : null;
        this.departureTime = departureTime ? new Date(departureTime) : null;
    }
}

module.exports = VesselScheduleAssignmentDTO;
