const VesselVisitExecutionDTO = require('../dtos/VesselVisitExecutionDTO');
const VesselVisitExecution = require('../../domain/vesselVisitExecutions/vesselVisitExecution');

class VesselVisitExecutionMapper {

    // Domain -> DTO (Returning data to User)
    static toDTO(domain) {
        if (!domain) return null;

        return new VesselVisitExecutionDTO({
            id: domain.id, // Mongoose virtual getter
            vesselVisitId: domain.vesselVisitId,
            vesselIMO: domain.vesselIMO,
            actualArrivalTime: domain.actualArrivalTime,
            status: domain.status,
            createdBy: domain.createdBy,
            createdAt: domain.createdAt
        });
    }

    // DTO -> Domain (Saving data to DB)
    static toDomain(createDto) {
        if (!createDto) return null;

        // Instantiate Mongoose Model
        return new VesselVisitExecution({
            vesselVisitId: createDto.vesselVisitId,
            vesselIMO: createDto.vesselIMO,
            actualArrivalTime: new Date(createDto.actualArrivalTime),
            createdBy: createDto.createdBy
            // status & createdAt are set by Schema defaults
        });
    }
}

module.exports = VesselVisitExecutionMapper;