const SchedulingResultDTO = require('../schedulingResultDTOs').SchedulingResultDTO;

class MultiCraneComparisonResultDTO {
    constructor(data) {
        // We reuse the SchedulingResultDTO we defined in the previous step
        this.singleCrane = new SchedulingResultDTO(data.singleCrane || {});
        this.multiCrane = data.multiCrane ? new SchedulingResultDTO(data.multiCrane) : null;
        
        // Optional calculation if passed from C#, or we can calculate it here
        this.craneHoursSingle = data.craneHoursSingle;
        this.craneHoursMulti = data.craneHoursMulti;
    }

    // Convenience Getters (Logic ported from C#)
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