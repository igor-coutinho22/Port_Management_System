class UpdateVesselVisitExecutionDTO {
    constructor(data) {
        // Defensive: Check for camelCase or PascalCase (frontend compatibility)
        this.berthTime = data.berthTime || data.BerthTime;
        // DockId is passed as a GUID String
        this.dockId = data.dockId || data.DockId; 
        this.author = data.author || data.Author || 'System'; 
    }
}

module.exports = UpdateVesselVisitExecutionDTO;