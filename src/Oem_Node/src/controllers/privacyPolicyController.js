const privacyPolicyService = require('../models/application/services/privacyPolicyService');

class PrivacyPolicyController {

    // RENAMED: getLatest -> getLatestPolicy
    async getLatestPolicy(req, res) {
        try {
            const policy = await privacyPolicyService.getLatestPolicy();
            if (!policy) {
                // If no policy exists yet, return a placeholder so frontend doesn't crash
                return res.status(200).json({ content: "No privacy policy published yet.", version: "0.0" });
            }
            res.status(200).json(policy);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // RENAMED: getHistory -> getPolicyHistory
    async getPolicyHistory(req, res) {
        try {
            const history = await privacyPolicyService.getPolicyHistory();
            res.status(200).json(history);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // RENAMED: create -> publishPolicy
    async publishPolicy(req, res) {
        try {
            const { content } = req.body;
            
            // FIX: The middleware attaches 'name' and 'id', not 'email'.
            // We fallback to "System Admin" if req.user is missing.
            const adminId = req.user ? (req.user.name || req.user.id) : "System Admin";

            // If for some reason it's still empty, force a string to satisfy Mongoose
            const finalAdminId = adminId || "Unknown Admin";

            const newPolicy = await privacyPolicyService.publishNewPolicy(finalAdminId, content);
            res.status(201).json(newPolicy);
        } catch (err) {
            console.error("Privacy Policy Publish Error:", err);
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new PrivacyPolicyController();