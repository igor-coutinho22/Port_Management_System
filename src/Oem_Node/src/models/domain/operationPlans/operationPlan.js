const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const OperationPlanStatus = require('./enums/operationPlanStatus');

// --- Constants ---
const MAX_PORT_CRANES = 20;
const MAX_PORT_STAFF = 100;

// ==========================================
// 1. Audit Log Schema (Sub-document)
// ==========================================
const AuditLogSchema = new mongoose.Schema({
    _id: { type: String, default: uuidv4 },
    author: { type: String, required: true },
    reason: { type: String, default: '' },
    changesDescription: { type: String, required: true },
    changedAt: { type: Date, default: Date.now }
});

// ==========================================
// 2. Operation Plan Item Schema (Sub-document)
// ==========================================
const OperationPlanItemSchema = new mongoose.Schema({
    _id: { type: String, default: uuidv4 },
    vesselVisitId: { type: String, required: true },
    vesselIMO: { type: String, required: true },
    
    // Windows
    serviceStartTime: { type: Date, required: true },
    serviceEndTime: { type: Date, required: true },
    
    unloadingStartTime: { type: Date, required: true },
    unloadingEndTime: { type: Date, required: true },
    
    loadingStartTime: { type: Date, required: true },
    loadingEndTime: { type: Date, required: true },
    
    // Resources
    numberOfCranes: { type: Number, required: true },
    numberOfStaff: { type: Number, required: true }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

// --- Item Logic: UpdateDetails ---
OperationPlanItemSchema.methods.updateDetails = function(newStart, newEnd, newCranes, newStaff, vvnUnloadWorkload, vvnLoadWorkload) {
    const changes = [];
    
    // 1. Calculate Duration
    const newDurationMinutes = (newEnd - newStart) / 60000; // ms to min

    // 2. Calculate Min Required Time
    const totalWorkload = vvnUnloadWorkload + vvnLoadWorkload;
    const minRequiredMinutes = totalWorkload / Math.max(1, newCranes);

    // 3. Validation (with 0.1 buffer)
    if (newDurationMinutes < (minRequiredMinutes - 0.1)) {
        throw new Error(
            `Invalid Duration: With ${newCranes} crane(s), min time is ${Math.ceil(minRequiredMinutes)} min. ` +
            `You allocated ${Math.floor(newDurationMinutes)} min.`
        );
    }

    // 4. Time Validation
    if (newStart >= newEnd) throw new Error("Start time must be before End time.");

    // 5. Detect Changes
    if (this.serviceStartTime.getTime() !== newStart.getTime()) changes.push(`Start updated`); // Simplified log
    if (this.serviceEndTime.getTime() !== newEnd.getTime()) changes.push(`End updated`);
    if (this.numberOfCranes !== newCranes) changes.push(`Cranes ${this.numberOfCranes}->${newCranes}`);
    if (this.numberOfStaff !== newStaff) changes.push(`Staff ${this.numberOfStaff}->${newStaff}`);

    if (changes.length === 0) return '';

    // 6. Recalculate Split
    const unloadRatio = totalWorkload > 0 ? (vvnUnloadWorkload / totalWorkload) : 0.5;
    const newUnloadDuration = newDurationMinutes * unloadRatio;

    // 7. Apply Updates
    this.serviceStartTime = newStart;
    this.serviceEndTime = newEnd;
    this.numberOfCranes = newCranes;
    this.numberOfStaff = newStaff;

    this.unloadingStartTime = newStart;
    // Add minutes to date
    this.unloadingEndTime = new Date(newStart.getTime() + newUnloadDuration * 60000);
    this.loadingStartTime = this.unloadingEndTime;
    this.loadingEndTime = newEnd;

    return changes.join(', ');
};

// ==========================================
// 3. Operation Plan Schema (Aggregate Root)
// ==========================================
const OperationPlanSchema = new mongoose.Schema({
    _id: { type: String, default: uuidv4 },
    
    scheduleDate: { type: Date, required: true }, // DateOnly stored as Date
    heuristicUsed: { type: String, default: '' },
    
    totalDelayMinutes: { type: Number, default: 0 },
    algorithmRuntimeSeconds: { type: Number, default: 0 },
    
    createdAt: { type: Date, default: Date.now },
    author: { type: String, default: '' },
    
    status: { 
        type: String, 
        enum: Object.values(OperationPlanStatus), 
        default: OperationPlanStatus.Draft 
    },

    // Embedded Collections
    items: [OperationPlanItemSchema],
    auditLog: [AuditLogSchema]

}, { 
    timestamps: true,
    toJSON: { 
        virtuals: true,
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            // Also transform items inside
            if(ret.items) ret.items.forEach(i => { i.id = i._id; delete i._id; });
            if(ret.auditLog) ret.auditLog.forEach(a => { a.id = a._id; delete a._id; });
        }
    },
    toObject: { virtuals: true } 
});

// --- Methods ---

// Add Item
OperationPlanSchema.methods.addItem = function(itemData) {
    // Mongoose push
    this.items.push(itemData);
};

// Remove Item
OperationPlanSchema.methods.removeItem = function(itemId) {
    this.items.pull({ _id: itemId });
};

// Add Audit Log
OperationPlanSchema.methods.addAuditLog = function(author, reason, changes) {
    this.auditLog.push({
        author, 
        reason, 
        changesDescription: changes,
        changedAt: new Date()
    });
};

// Approve Plan
OperationPlanSchema.methods.approvePlan = function() {
    if (this.status !== OperationPlanStatus.Draft) {
        throw new Error("Only draft plans can be approved.");
    }
    this.status = OperationPlanStatus.Approved;
};

// Execute Plan
OperationPlanSchema.methods.executePlan = function() {
    if (this.status !== OperationPlanStatus.Approved) {
        throw new Error("Only approved plans can be executed.");
    }
    this.status = OperationPlanStatus.Executed;
};

// UPDATE ITEM (The Big Business Logic)
OperationPlanSchema.methods.updateItem = function(updateInfo, author, reason) {
    // 1. Find item (in subdocument array)
    const item = this.items.id(updateInfo.itemId);
    if (!item) {
        throw new Error(`Item with ID ${updateInfo.itemId} not found in this plan.`);
    }

    // 2. Resource Overlap Validation
    // Find neighbors overlapping with the NEW time range
    const overlappingItems = this.items.filter(i => 
        i.id !== updateInfo.itemId && // Exclude self
        i.serviceStartTime < updateInfo.serviceEndTime &&
        i.serviceEndTime > updateInfo.serviceStartTime
    );

    // Sum resources
    // reduce is JS equivalent of LINQ .Sum()
    const cranesInUse = overlappingItems.reduce((sum, i) => sum + i.numberOfCranes, 0);
    const staffInUse = overlappingItems.reduce((sum, i) => sum + i.numberOfStaff, 0);

    // Validate Limits
    if ((cranesInUse + updateInfo.numberOfCranes) > MAX_PORT_CRANES) {
        throw new Error(
            `Resource Conflict: Updating item ${item.vesselIMO} requires ${updateInfo.numberOfCranes} cranes, ` +
            `but ${cranesInUse} are already active. Total exceeds limit of ${MAX_PORT_CRANES}.`
        );
    }

    if ((staffInUse + updateInfo.numberOfStaff) > MAX_PORT_STAFF) {
        throw new Error(
            `Resource Conflict: Updating item ${item.vesselIMO} requires ${updateInfo.numberOfStaff} staff, ` +
            `but ${staffInUse} are already active. Total exceeds limit of ${MAX_PORT_STAFF}.`
        );
    }

    // 3. Delegate logic to the Item Schema method
    const change = item.updateDetails(
        updateInfo.serviceStartTime,
        updateInfo.serviceEndTime,
        updateInfo.numberOfCranes,
        updateInfo.numberOfStaff,
        updateInfo.minUnloadMinutes, // Workload passed as "minutes" or units roughly
        updateInfo.minLoadMinutes
    );

    // 4. Log
    if (change) {
        this.addAuditLog(author, reason, `Item ${item.vesselIMO}: ${change}`);
    }
};

module.exports = mongoose.model('OperationPlan', OperationPlanSchema);