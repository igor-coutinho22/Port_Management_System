const privacyPolicyRepository = require('../../infrastructure/repositories/privacyPolicyRepository');

class PrivacyPolicyService {

    async getLatestPolicy() {
        return await privacyPolicyRepository.findLatestActiveAsync();
    }

    async getPolicyHistory() {
        return await privacyPolicyRepository.findAllAsync();
    }

    async publishNewPolicy(adminId, content) {
        // 1. Get the current latest to calculate version
        const latest = await privacyPolicyRepository.findLatestActiveAsync();
        
        let nextVersion = "1.0";
        if (latest) {
            // Parse "1.0" -> 1.0, add 0.1 -> 1.1
            const currentVer = parseFloat(latest.version);
            nextVersion = (currentVer + 0.1).toFixed(1);
        }

        // 2. Create the new policy object
        const newPolicy = {
            content,
            version: nextVersion.toString(),
            adminId,
            isActive: true,
            publishedAt: new Date()
        };

        // 3. Save to DB
        return await privacyPolicyRepository.createAsync(newPolicy);
    }
}

module.exports = new PrivacyPolicyService();