class IncidentTypeDTO {
    constructor(data) {
        this.id = data._id || data.id;
        this.code = data.code;
        this.name = data.name;
        this.description = data.description;
        this.severity = data.severity;
        this.parentTypeId = data.parentTypeId; // For hierarchy
    }
}
module.exports = IncidentTypeDTO;