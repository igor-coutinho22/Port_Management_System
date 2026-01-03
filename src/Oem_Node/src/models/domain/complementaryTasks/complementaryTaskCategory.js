const mongoose = require('mongoose');

const complementaryTaskCategorySchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        match: [/^[A-Z0-9_-]{3,20}$/, 'Code must be 3-20 characters (A-Z, 0-9, -, _)']
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
    defaultDuration: {
        type: Number, // In minutes
        default: 0
    },
    // US 4.1.15: "Suspends execution" vs "Parallel"
    expectedImpact: {
        type: String,
        enum: ['Parallel', 'Suspension'], 
        default: 'Parallel',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ComplementaryTaskCategory', complementaryTaskCategorySchema);