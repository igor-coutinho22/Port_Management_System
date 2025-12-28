class CreateVesselVisitExecutionDTO {
    constructor(data) {
        this.vesselVisitId = data.vesselVisitId;
        // Handle defaults like string.Empty in C#
        this.vesselIMO = data.vesselIMO || ''; 
        // Ensure date is valid or pass as is
        this.actualArrivalTime = data.actualArrivalTime; 
        this.createdBy = data.createdBy || '';
    }
}

module.exports = CreateVesselVisitExecutionDTO;