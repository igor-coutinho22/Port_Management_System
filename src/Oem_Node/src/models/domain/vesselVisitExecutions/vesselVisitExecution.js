const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const vesselVisitExecutionSchema = new mongoose.Schema({
    // We override the default Mongo _id to use a GUID (String), matching C# Guid.NewGuid()
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
    createdBy: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: 'In Progress'
    }
}, {
    // This creates 'createdAt' and 'updatedAt' automatically. 
    // Mongoose manages CreatedAt, matching your C# "CreatedAt = DateTime.UtcNow"
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
    // Mongoose doesn't auto-save on method calls usually, but we can't save here easily without async.
    // In Node, we usually manipulate the object in the service and then .save().
    // However, this method acts as the domain logic container.
};

module.exports = mongoose.model('VesselVisitExecution', vesselVisitExecutionSchema);