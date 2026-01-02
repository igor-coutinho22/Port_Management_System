const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    incidentTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IncidentType',
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['Active', 'Resolved'],
        default: 'Active'
    },
    severity: {
        type: String,
        enum: ['Minor', 'Major', 'Critical'],
        default: 'Minor'
    },
    scope: {
        type: String,
        enum: ['Global', 'Specific'],
        default: 'Specific'
    },
    // We reference the unique Mongo _id of the VVE documents (which are UUID Strings)
    affectedVesselVisitIds: [{
        type: String,
        ref: 'VesselVisitExecution'
    }],
    responsibleUser: {
        type: String, // Storing the username or email of the creator
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for automated duration computation
incidentSchema.virtual('duration').get(function () {
    if (this.endTime && this.startTime) {
        return Math.round((this.endTime - this.startTime) / 60000); // Duration in minutes
    }
    return null;
});

module.exports = mongoose.model('Incident', incidentSchema);
