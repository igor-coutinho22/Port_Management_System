const VesselVisitExecutionDTO = require('../dtos/VesselVisitExecutionDTO');
const VesselVisitExecution = require('../../domain/vesselVisitExecutions/vesselVisitExecution');

class VesselVisitExecutionMapper {

    static toDTO(domain) {
        if (!domain) return null;

        // --- FIXED LOGIC ---
        // Instead of searching the whole history, check ONLY the latest Audit Log entry.
        // The service ensures that every update re-evaluates the discrepancy.
        let warning = null;
        
        // 1. Check if we have a "live" discrepancy attached (from the immediate Service response)
        if (domain.latestDiscrepancy) {
            warning = domain.latestDiscrepancy;
        } 
        // 2. Otherwise, look at the stored Audit Log
        else if (domain.auditLog && domain.auditLog.length > 0) {
            // Get the very last entry
            const latestLog = domain.auditLog[domain.auditLog.length - 1];
            
            // If the LATEST action had a warning, display it.
            // If the latest action fixed it, this will be false.
            if (latestLog.details && latestLog.details.includes('Warning')) {
                // You can return the full string or a generic message
                warning = "Discrepancy recorded: Dock mismatch"; 
            }
        }

        return new VesselVisitExecutionDTO({
            id: domain.id, 
            vesselVisitId: domain.vesselVisitId,
            vesselIMO: domain.vesselIMO,
            actualArrivalTime: domain.actualArrivalTime,
            status: domain.status,
            createdBy: domain.createdBy,
            createdAt: domain.createdAt,
            berthTime: domain.berthTime,
            dockId: domain.dockId,
            auditLog: domain.auditLog,
            
            // Populate DTO field for frontend warning
            discrepancy: warning 
        });
    }

    static toDomain(createDto) {
        if (!createDto) return null;

        return new VesselVisitExecution({
            vesselVisitId: createDto.vesselVisitId,
            vesselIMO: createDto.vesselIMO,
            actualArrivalTime: new Date(createDto.actualArrivalTime),
            createdBy: createDto.createdBy,
            
            // Map optional fields if present
            berthTime: createDto.berthTime ? new Date(createDto.berthTime) : null,
            dockId: createDto.dockId || null
        });
    }
}

module.exports = VesselVisitExecutionMapper;