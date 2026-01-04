class DailyScheduleRequestDTO {
    constructor(data) {
        this.targetDate = data.targetDate; // Expecting string 'YYYY-MM-DD' or Date object
        this.heuristic = data.heuristic || '';
    }
}

module.exports = DailyScheduleRequestDTO;