const User = require('../models/domain/user');
const privacyRepo = require('../models/infrastructure/repositories/privacyPolicyRepository');

class UserController {

    // GET /api/users/me
    async getMe(req, res) {
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
}

module.exports = new UserController();