class UpdateVesselVisitExecutionDTO {
    constructor(data) {
        this.berthTime = data.berthTime || data.BerthTime;
        this.dockId = data.dockId || data.DockId;
        
        // If operationId is present, we treat this as an operation update
        this.operationId = data.operationId || data.OperationId; 
        this.operationType = data.operationType || data.type || 'Unknown';
        this.operationStatus = data.operationStatus || data.status; // 'Started', 'Completed', 'Delayed'
        
        this.actualStartTime = data.actualStartTime;
        this.actualEndTime = data.actualEndTime;
        
        this.staff = data.staff;
        this.cranes = data.cranes;

        this.author = data.author || data.Author || 'System'; 
    }
}

module.exports = UpdateVesselVisitExecutionDTO;