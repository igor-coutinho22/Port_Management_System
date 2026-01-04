const User = require('../models/domain/user');
const privacyRepo = require('../models/infrastructure/repositories/privacyPolicyRepository');

class UserController {

    // GET /api/users/privacy-status
    async getPrivacyStatus(req, res) {
        try {
            // 1. Get user data from the Token (Middleware put it in req.user)
            const tokenUser = req.user;
            if (!tokenUser || !tokenUser.id) {
                return res.status(401).json({ message: "Not authenticated" });
            }

            // 2. Find User in Mongo, or Create if it's their first time (JIT Provisioning)
            let dbUser = await User.findOne({ userId: tokenUser.id });

            if (!dbUser) {
                dbUser = new User({
                    userId: tokenUser.id,
                    name: tokenUser.name,
                    email: tokenUser.email || tokenUser.emails?.[0], // Handle various token formats
                    roles: tokenUser.roles,
                    acceptedPrivacyPolicyVersion: "0.0"
                });
                await dbUser.save();
            }

            // 3. Check for Privacy Policy Updates
            const latestPolicy = await privacyRepo.findLatestActiveAsync();
            
            // Check: Does the user's version match the latest system version?
            // If latestPolicy exists AND user's version is different => Must Accept
            const mustAcceptPrivacy = latestPolicy && 
                                      (dbUser.acceptedPrivacyPolicyVersion !== latestPolicy.version);

            // 4. Return combined data
            res.json({
                userId: dbUser.userId,
                name: dbUser.name,
                email: dbUser.email,
                roles: tokenUser.roles, // Always trust the Token for roles
                mustAcceptPrivacy: mustAcceptPrivacy, // <--- FRONTEND USES THIS
                currentPolicyVersion: latestPolicy ? latestPolicy.version : "0.0"
            });

        } catch (err) {
            console.error("GetMe Error:", err);
            res.status(500).json({ error: err.message });
        }
    }

    // POST /api/users/accept-privacy
    async acceptPrivacyPolicy(req, res) {
        try {
            const tokenUser = req.user;
            
            // Get the latest version from DB
            const latestPolicy = await privacyRepo.findLatestActiveAsync();
            if (!latestPolicy) {
                return res.status(400).json({ message: "No active policy to accept." });
            }

            // Update User
            await User.findOneAndUpdate(
                { userId: tokenUser.id },
                { 
                    acceptedPrivacyPolicyVersion: latestPolicy.version,
                    lastLoginAt: new Date()
                },
                { upsert: true } // Create if doesn't exist
            );

            res.json({ success: true, version: latestPolicy.version });

        } catch (err) {
            console.error("AcceptPrivacy Error:", err);
            res.status(500).json({ error: err.message });
        }
    }

    // GET /api/users/me/export
    async exportUserData(req, res) {
        try {
            const tokenUser = req.user;
            
            // 1. Fetch Core Profile from MongoDB
            // Ensure you are importing the User model at the top of this file
            const dbUser = await User.findOne({ userId: tokenUser.id });
            
            if (!dbUser) {
                return res.status(404).json({ message: "User profile not found." });
            }

            // 2. Construct the Data Package
            // This structure complies with GDPR Article 15 (Right of Access)
            const exportData = {
                metadata: {
                    exportedAt: new Date(),
                    system: "Port Management System (Sines)",
                    requestType: "GDPR Right to Access - Article 15"
                },
                identity: {
                    id: dbUser.userId,
                    name: dbUser.name,
                    email: dbUser.email,
                    roles: dbUser.roles
                },
                compliance: {
                    acceptedPrivacyPolicyVersion: dbUser.acceptedPrivacyPolicyVersion,
                    lastLoginAt: dbUser.lastLoginAt,
                    status: "Active"
                },
                // If you had logs, you would fetch and add them here:
                // activityLogs: await Log.find({ userId: tokenUser.id })
            };

            // 3. Send as Downloadable JSON
            res.setHeader('Content-Type', 'application/json');
            // This header forces the browser to treat it as a file download
            res.setHeader('Content-Disposition', `attachment; filename=my-data-${tokenUser.id}.json`);
            
            // Send pretty-printed JSON (indentation 4)
            res.send(JSON.stringify(exportData, null, 4));

        } catch (err) {
            console.error("Export Data Error:", err);
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new UserController();