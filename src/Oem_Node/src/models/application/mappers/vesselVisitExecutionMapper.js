const VesselVisitExecutionDTO = require("../dtos/VesselVisitExecutionDTO");
const VesselVisitExecution = require("../../domain/vesselVisitExecutions/vesselVisitExecution");

class VesselVisitExecutionMapper {
  static toDTO(domain) {
    if (!domain) return null;

    // --- FIXED LOGIC ---
    // Instead of searching the whole history, check ONLY the latest Audit Log entry.
    // The service ensures that every update re-evaluates the discrepancy.
    let warning = null;

    // 1. Check if there is a "live" discrepancy attached (from the immediate Service response)
    if (domain.latestDiscrepancy) {
      warning = domain.latestDiscrepancy;
    }
    // 2. Otherwise, look at the stored Audit Log
    else if (domain.auditLog && domain.auditLog.length > 0) {
      // Get the very last entry
      const latestLog = domain.auditLog[domain.auditLog.length - 1];

      // If the LATEST action had a warning, display it.
      // If the latest action fixed it, this will be false.
      if (latestLog.details && latestLog.details.includes("Warning")) {
        // Ccan return the full string or a generic message
        warning = "Discrepancy recorded: Dock mismatch";
      }
    }

    const arrival = domain.actualArrivalTime
      ? new Date(domain.actualArrivalTime)
      : null;
    const berth = domain.berthTime ? new Date(domain.berthTime) : null;
    const complete = domain.completedTime
      ? new Date(domain.completedTime)
      : null;

    const metrics = {
      waitingTimeMinutes: null,
      berthOccupancyMinutes: null,
      totalTurnaroundMinutes: null,
    };

    // 1. Waiting Time (Arrival -> Berth)
    if (arrival && berth) {
      metrics.waitingTimeMinutes = Math.floor((berth - arrival) / 60000);
    }

    // 2. Occupancy (Berth -> Complete)
    if (berth && complete) {
      metrics.berthOccupancyMinutes = Math.floor((complete - berth) / 60000);
    }

    // 3. Turnaround (Arrival -> Complete)
    if (arrival && complete) {
      metrics.totalTurnaroundMinutes = Math.floor((complete - arrival) / 60000);
    } else if (arrival && !complete) {
      // Optional: If still in progress, calc duration until NOW?
      // metrics.totalTurnaroundMinutes = Math.floor((new Date() - arrival) / 60000);
    }

    const dto = new VesselVisitExecutionDTO({
      id: domain.id,
      vesselVisitId: domain.vesselVisitId,
      vesselIMO: domain.vesselIMO,
      actualArrivalTime: domain.actualArrivalTime,
      status: domain.status,
      createdBy: domain.createdBy,
      createdAt: domain.createdAt,
      completedTime: domain.completedTime,
      berthTime: domain.berthTime,
      dockId: domain.dockId,
      auditLog: domain.auditLog,
      discrepancy: warning,
      metrics: metrics,
    });

    dto.executedOperations = domain.executedOperations || [];

    return dto;
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
      dockId: createDto.dockId || null,
    });
  }
}

module.exports = VesselVisitExecutionMapper;
