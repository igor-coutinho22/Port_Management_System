const PrivacyPolicy = require('../../domain/privacy/privacyPolicy');

class PrivacyPolicyRepository {
    
    // Get the absolute latest policy (for the public view)
    async findLatestActiveAsync() {
        return await PrivacyPolicy.findOne({ isActive: true })
            .sort({ publishedAt: -1 }); // Newest first
    }

    // Get history (for the Admin table)
    async findAllAsync() {
        return await PrivacyPolicy.find()
            .sort({ publishedAt: -1 });
    }

    async createAsync(policyData) {
        const policy = new PrivacyPolicy(policyData);
        return await policy.save();
    }
}

module.exports = new PrivacyPolicyRepository();