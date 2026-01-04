const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // We use the ID or Email from the Token as the unique key
    userId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: { type: String },
    name: { type: String },
    roles: [String], // Cache roles here if needed
    
    // --- THE IMPORTANT PART FOR GDPR ---
    acceptedPrivacyPolicyVersion: {
        type: String,
        default: "0.0" // Default to 0 so they are forced to accept v1.0
    },
    lastLoginAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);