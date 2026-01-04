class PlanItemUpdateInfo {
    constructor(itemId, start, end, cranes, staff, minUnload, minLoad) {
        this.itemId = itemId;
        this.serviceStartTime = new Date(start);
        this.serviceEndTime = new Date(end);
        this.numberOfCranes = cranes;
        this.numberOfStaff = staff;
        this.minUnloadMinutes = minUnload;
        this.minLoadMinutes = minLoad;
    }
}

module.exports = PlanItemUpdateInfo;