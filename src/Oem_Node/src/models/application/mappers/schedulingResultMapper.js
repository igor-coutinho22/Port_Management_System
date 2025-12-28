const { SchedulingResultDTO, VesselScheduleEntryDTO } = require('../dtos/schedulingResultDTOs');

class SchedulingResultMapper {
    
    static toDTO(domain) {
        if (!domain) {
            return new SchedulingResultDTO({});
        }

        return new SchedulingResultDTO({
            heuristicName: domain.heuristicName,
            totalDelayMinutes: domain.totalDelayMinutes,
            runtimeSeconds: domain.runtimeSeconds,
            warnings: domain.warnings ? [...domain.warnings] : [], // Clone array
            entries: (domain.entries || []).map(e => new VesselScheduleEntryDTO({
                vesselVisitId: e.vesselVisitId,
                vesselIMO: e.vesselIMO,
                startTime: e.startTime,
                endTime: e.endTime,
                assignedCraneId: e.assignedCraneId,
                staffMecNumbers: e.staffMecNumbers ? [...e.staffMecNumbers] : [],
                delayMinutes: e.delayMinutes
            }))
        });
    }
}

module.exports = SchedulingResultMapper;