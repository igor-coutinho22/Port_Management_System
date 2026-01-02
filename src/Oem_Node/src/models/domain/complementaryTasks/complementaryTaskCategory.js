const mongoose = require('mongoose');

const complementaryTaskCategorySchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    defaultDuration: {
        type: Number, // Duration in minutes
        default: 0
    },
    expectedImpact: {
        type: String,
        enum: ['Parallel', 'Suspension'],
        default: 'Parallel'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ComplementaryTaskCategory', complementaryTaskCategorySchema);
