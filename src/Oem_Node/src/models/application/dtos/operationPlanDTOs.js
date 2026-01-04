const { VesselScheduleEntryDTO } = require('./schedulingResultDTOs');

class OperationPlanDTO {
    constructor(data) {
        this.id = data.id;
        
        // FIX: Format date to YYYY-MM-DD string
        if (data.scheduleDate instanceof Date) {
            this.scheduleDate = data.scheduleDate.toISOString().split('T')[0];
        } else {
            this.scheduleDate = data.scheduleDate;
        }

        this.heuristicUsed = data.heuristicUsed || '';
        this.status = data.status || '';
        this.totalDelayMinutes = data.totalDelayMinutes || 0;
        this.runtimeSeconds = data.runtimeSeconds || 0;
        this.author = data.author || '';
        
        this.items = (data.items || []).map(item => new OperationPlanItemDTO(item));
    }
}

class CreateOperationPlanDTO {
    constructor(data) {
        this.id = data.id;
        this.scheduleDate = data.scheduleDate;
        this.heuristicUsed = data.heuristicUsed || '';
        this.totalDelayMinutes = data.totalDelayMinutes || 0;
        this.runtimeSeconds = data.runtimeSeconds || 0;
        this.author = data.author || '';
        
        // Uses the VesselScheduleEntryDTO from the scheduling results
        this.entries = (data.entries || []).map(entry => new VesselScheduleEntryDTO(entry));
    }
}

class OperationPlanItemDTO {
    constructor(data) {
        this.id = data.id;
        this.vesselVisitId = data.vesselVisitId;
        this.vesselIMO = data.vesselIMO || '';
        
        this.serviceStartTime = data.serviceStartTime;
        this.serviceEndTime = data.serviceEndTime;
        
        this.unloadingStartTime = data.unloadingStartTime;
        this.unloadingEndTime = data.unloadingEndTime;
        
        this.loadingStartTime = data.loadingStartTime;
        this.loadingEndTime = data.loadingEndTime;
        
        this.numberOfCranes = data.numberOfCranes || 0;
        this.numberOfStaff = data.numberOfStaff || 0;
    }
}

class UpdateOperationPlanDTO {
    constructor(data) {
        // Defensive: Check for 'item' OR 'Item'
        const itemData = data.item || data.Item || {};
        this.item = new UpdateOperationPlanItemDTO(itemData);
        
        this.author = data.author || data.Author || '';
        this.reason = data.reason || data.Reason || '';
    }
}

class UpdateOperationPlanItemDTO {
    constructor(data) {
        // Defensive: Check for 'itemId' OR 'ItemId'
        this.itemId = data.itemId || data.ItemId;
        
        this.serviceStartTime = data.serviceStartTime || data.ServiceStartTime;
        this.serviceEndTime = data.serviceEndTime || data.ServiceEndTime;
        
        this.numberOfCranes = (data.numberOfCranes !== undefined) ? data.numberOfCranes : (data.NumberOfCranes || 0);
        this.numberOfStaff = (data.numberOfStaff !== undefined) ? data.numberOfStaff : (data.NumberOfStaff || 0);
        
        this.minUnloadMinutes = data.minUnloadMinutes || data.MinUnloadMinutes || 0;
        this.minLoadMinutes = data.minLoadMinutes || data.MinLoadMinutes || 0;
    }
}

module.exports = {
    OperationPlanDTO,
    CreateOperationPlanDTO,
    OperationPlanItemDTO,
    UpdateOperationPlanDTO,
    UpdateOperationPlanItemDTO
};