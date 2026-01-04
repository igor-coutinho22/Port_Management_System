class VesselVisitNotificationDTO {
    constructor(data) {
        this.id = data.id;
        this.vesselIMO = data.vesselIMO;
        this.shippingAgentOrganizationId = data.shippingAgentOrganizationId;
        this.dockId = data.dockId;
        this.visitDate = data.visitDate;
        this.status = data.status || '';
        this.purpose = data.purpose || '';
        
        this.loadingManifest = data.loadingManifest ? new CargoManifestDTO(data.loadingManifest) : null;
        this.unloadingManifest = data.unloadingManifest ? new CargoManifestDTO(data.unloadingManifest) : null;
        this.crew = (data.crew || []).map(c => new CrewMemberDTO(c));
        
        this.arrivalTime = data.arrivalTime;
        this.desiredDepartureTime = data.desiredDepartureTime;
        this.estimatedLoadingDurationMinutes = data.estimatedLoadingDurationMinutes || 0;
        this.estimatedUnloadingDurationMinutes = data.estimatedUnloadingDurationMinutes || 0;
    }
}

class CargoManifestDTO {
    constructor(data) {
        this.id = data.id;
        this.type = data.type || '';
        this.containers = (data.containers || []).map(c => new ContainerDTO(c));
    }
}

class ContainerDTO {
    constructor(data) {
        this.identifier = data.identifier || '';
    }
}

class CrewMemberDTO {
    constructor(data) {
        this.name = data.name || '';
        this.citizenId = data.citizenId || '';
        this.nationality = data.nationality || '';
    }
}

class RejectReasonDTO {
    constructor(data) {
        this.reason = data.reason || '';
    }
}

class VesselVisitNotificationFilterDTO {
    constructor(data) {
        this.vesselIMO = data.vesselIMO;
        this.status = data.status;
        this.fromDate = data.fromDate;
        this.toDate = data.toDate;
    }
}

module.exports = {
    VesselVisitNotificationDTO,
    CargoManifestDTO,
    ContainerDTO,
    CrewMemberDTO,
    RejectReasonDTO,
    VesselVisitNotificationFilterDTO
};