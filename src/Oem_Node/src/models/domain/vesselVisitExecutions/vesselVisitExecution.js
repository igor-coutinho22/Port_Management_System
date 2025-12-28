const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// --- New Audit Log Schema (US 4.1.8) ---
const auditLogSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    author: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: String }
}, { _id: false });

const vesselVisitExecutionSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4
    },
    vesselVisitId: {
        type: String,
        required: true
    },
    vesselIMO: {
        type: String,
        required: true,
        default: ''
    },
    actualArrivalTime: {
        type: Date,
        required: true
    },
    berthTime: { 
        type: Date, 
        default: null 
    },
    dockId: { 
        type: String, // Stores the Dock GUID
        default: null 
    },
    auditLog: [auditLogSchema],
    // -------------------------------

    createdBy: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: 'InProgress' // Normalized to 'InProgress' or 'Completed'
    },
    completedTime: {
        type: Date,
        default: null
    }
}, {
    // This creates 'createdAt' and 'updatedAt' automatically.
    timestamps: true, 

    // This ensures that when you convert to JSON, the '_id' field is also mapped to 'id'
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    },
    toObject: { virtuals: true }
});

// --- Methods (Behavior) ---
// Matches: public void Complete()
vesselVisitExecutionSchema.methods.complete = function() {
    this.status = 'Completed';
    this.completedTime = new Date();
};

module.exports = mongoose.model('VesselVisitExecution', vesselVisitExecutionSchema);