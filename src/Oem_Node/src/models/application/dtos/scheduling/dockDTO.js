class DockDTO {
    constructor({
        id = null,
        name = '',
        location = '',
        lengthMeters = 0,
        depthMeters = 0,
        maxDraftMeters = 0,
        allowedVesselTypes = []
    } = {}) {
        this.id = id; // can be a string (UUID)
        this.name = name;
        this.location = location;
        this.lengthMeters = lengthMeters;
        this.depthMeters = depthMeters;
        this.maxDraftMeters = maxDraftMeters;
        this.allowedVesselTypes = allowedVesselTypes; // array of strings
    }
}

module.exports = DockDTO;
