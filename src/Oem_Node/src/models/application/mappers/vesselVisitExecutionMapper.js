const VesselVisitExecution = require('../../domain/vesselVisitExecutions/vesselVisitExecution');
const VesselVisitExecutionDTO = require('../dtos/VesselVisitExecutionDTO');

class VesselVisitExecutionMapper {

    // Matches: public static VesselVisitExecutionDTO ToDTO(VesselVisitExecution entity)
    static toDTO(entity) {
        if (!entity) return null;

        // We use the VesselVisitExecutionDTO class constructor to ensure the structure matches C#
        return new VesselVisitExecutionDTO({
            // Mongoose virtual 'id' or raw '_id'
            id: entity.id || entity._id, 
            vesselVisitId: entity.vesselVisitId,
            vesselIMO: entity.vesselIMO,
            actualArrivalTime: entity.actualArrivalTime,
            createdBy: entity.createdBy,
            createdAt: entity.createdAt,
            status: entity.status
        });
    }

    // Matches: public static VesselVisitExecution ToDomain(this CreateVesselVisitExecutionDTO dto)
    static toDomain(createDto) {
        if (!createDto) return null;

        // In Mongoose, we instantiate the Model (Entity) passing the properties as an object
        // This is equivalent to calling the C# constructor: new VesselVisitExecution(...)
        return new VesselVisitExecution({
            vesselVisitId: createDto.vesselVisitId,
            vesselIMO: createDto.vesselIMO,
            actualArrivalTime: createDto.actualArrivalTime,
            createdBy: createDto.createdBy,
            // Status and CreatedAt are handled by default values in the Schema/Entity
        });
    }
}

module.exports = VesselVisitExecutionMapper;