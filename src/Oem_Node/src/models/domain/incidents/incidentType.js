const mongoose = require('mongoose');

const incidentTypeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    severity: {
        type: String,
        enum: ['Minor', 'Major', 'Critical'],
        default: 'Minor'
    },
    parentTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IncidentType',
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('IncidentType', incidentTypeSchema);
