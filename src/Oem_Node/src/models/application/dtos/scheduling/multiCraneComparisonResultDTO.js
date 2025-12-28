const SchedulingResultDTO = require('../schedulingResultDTOs').SchedulingResultDTO;

class MultiCraneComparisonResultDTO {
    constructor(data) {
        this.singleCrane = new SchedulingResultDTO(data.singleCrane || {});
        this.multiCrane = data.multiCrane ? new SchedulingResultDTO(data.multiCrane) : null;
        
        this.craneHoursSingle = data.craneHoursSingle;
        this.craneHoursMulti = data.craneHoursMulti;
    }

    get multiCraneUsed() {
        return this.multiCrane !== null && 
               this.multiCrane.totalDelayMinutes < this.singleCrane.totalDelayMinutes;
    }

    get delayImprovementMinutes() {
        if (!this.multiCrane) return null;
        return this.singleCrane.totalDelayMinutes - this.multiCrane.totalDelayMinutes;
    }
}

module.exports = MultiCraneComparisonResultDTO;