const mongoose = require('mongoose');

const complementaryTaskSchema = new mongoose.Schema({
    complementaryTaskCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ComplementaryTaskCategory',
        required: true
    },
    responsibleTeam: {
        type: String,
        required: true
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
        enum: ['Ongoing', 'Completed'],
        default: 'Ongoing'
    },
    vesselVisitExecutionId: {
        type: String,
        ref: 'VesselVisitExecution',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for automated duration computation
complementaryTaskSchema.virtual('duration').get(function () {
    if (this.endTime && this.startTime) {
        return Math.round((this.endTime - this.startTime) / 60000); // Duration in minutes
    }
    return null;
});

module.exports = mongoose.model('ComplementaryTask', complementaryTaskSchema);
