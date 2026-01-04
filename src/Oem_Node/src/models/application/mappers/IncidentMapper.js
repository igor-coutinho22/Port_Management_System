const IncidentDTO = require('../dtos/IncidentDTO');
const IncidentTypeDTO = require('../dtos/IncidentTypeDTO');

class IncidentMapper {
    
    static toTypeDTO(domain) {
        if (!domain) return null;
        return new IncidentTypeDTO(domain);
    }

    static toIncidentDTO(domain) {
        if (!domain) return null;

        const dto = new IncidentDTO(domain);

        // Handle Populated Incident Type
        if (domain.incidentTypeId && domain.incidentTypeId.name) {
            dto.type = {
                id: domain.incidentTypeId._id,
                name: domain.incidentTypeId.name,
                code: domain.incidentTypeId.code
            };
        }

        // Handle Populated VVEs (if any)
        if (domain.affectedVesselVisitIds && domain.affectedVesselVisitIds.length > 0) {
            // Check if it's an object (populated) or just a string ID
            if (typeof domain.affectedVesselVisitIds[0] === 'object') {
                dto.affectedVessels = domain.affectedVesselVisitIds.map(v => ({
                    id: v._id || v.id,
                    name: v.vesselName || 'Unknown Vessel'
                }));
            }
        }

        // --- DURATION CALCULATION (US 4.1.13) ---
        // "When resolved... duration must be computed automatically."
        if (domain.startTime && domain.endTime) {
            const start = new Date(domain.startTime);
            const end = new Date(domain.endTime);
            const diffMs = end - start;
            dto.durationMinutes = Math.floor(diffMs / 60000); // Convert ms to minutes
        } else if (domain.startTime && !domain.endTime) {
            // Optional: Show "Time Elapsed so far" for Active incidents
            const start = new Date(domain.startTime);
            const now = new Date();
            dto.durationMinutes = Math.floor((now - start) / 60000);
        }

        return dto;
    }
}

module.exports = IncidentMapper;