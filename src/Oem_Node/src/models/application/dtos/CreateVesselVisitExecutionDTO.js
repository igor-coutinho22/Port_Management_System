class CreateVesselVisitExecutionDTO {
    constructor(data) {
        // Defensive: Check for camelCase OR PascalCase
        this.vesselVisitId = data.vesselVisitId || data.VesselVisitId;
        this.vesselIMO = data.vesselIMO || data.VesselIMO || '';
        this.actualArrivalTime = data.actualArrivalTime || data.ActualArrivalTime;
        this.createdBy = data.createdBy || data.CreatedBy || 'System';
        this.berthTime = data.berthTime || data.BerthTime || null;
        this.dockId = data.dockId || data.DockId || null;
    }
}

module.exports = CreateVesselVisitExecutionDTO;