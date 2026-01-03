const mongoose = require('mongoose');

const privacyPolicySchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Policy content is required']
    },
    version: {
        type: String,
        required: true,
        default: "1.0"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    adminId: {
        type: String, // Store the ID/Email of the admin who published it
        required: true
    },
    publishedAt: {
        type: Date,
        default: Date.now
    }
});

// Index to help sort by newest quickly
privacyPolicySchema.index({ publishedAt: -1 });

module.exports = mongoose.model('PrivacyPolicy', privacyPolicySchema);