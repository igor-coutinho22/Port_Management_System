const VesselScheduleEntry = require('./vesselScheduleEntry');

class SchedulingResult {
    constructor(data) {
        this.heuristicName = data.heuristicName || '';
        this.totalDelayMinutes = data.totalDelayMinutes || 0;
        this.runtimeSeconds = data.runtimeSeconds || 0;
        
        this.entries = (data.entries || []).map(e => new VesselScheduleEntry(e));
        this.warnings = data.warnings || [];
    }
}

module.exports = SchedulingResult;