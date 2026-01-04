class ComplementaryTaskDTO {
    constructor(id, category, responsibleTeam, startTime, endTime, status, durationMinutes, vesselVisitExecutionId) {
        this.id = id;
        // 'category' will be a nested ComplementaryTaskCategoryDTO object
        this.category = category; 
        this.responsibleTeam = responsibleTeam;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.durationMinutes = durationMinutes;
        this.vesselVisitExecutionId = vesselVisitExecutionId;
    }
}

module.exports = ComplementaryTaskDTO;