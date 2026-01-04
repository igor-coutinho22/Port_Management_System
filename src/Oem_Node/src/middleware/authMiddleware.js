const jwt = require('jsonwebtoken');
const graphClient = require('../config/graphClient');

// Role Constants (Matches Oem.Security.Roles)
const ROLES = {
    Admin: 'Admin',
    Operator: 'Operator',
    Officer: 'Officer',
    Representative: 'Representative'
};

// Helper: Matches your C# 'DecodeRoles' logic
const decodeRoles = (rawString) => {
    if (!rawString) return [];
    return rawString.split(';')
        .map(r => r.trim())
        .filter(r => r.length > 0);
};

// Helper: The Custom Attribute Name logic
const getExtAttributeName = () => {
    const appId = process.env.AZURE_EXTENSIONS_APP_ID;
    return `extension_${appId}_Role`;
};

// Main Middleware Factory
const requireAuth = (requiredRole = null) => {
    return async (req, res, next) => {
        try {
            // 1. Extract Token
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ message: 'Unauthorized: No token provided.' });
            }
            const token = authHeader.split(' ')[1];

            // 2. Decode Token (Get claims)
            const decoded = jwt.decode(token);
            if (!decoded) {
                return res.status(401).json({ message: 'Invalid token.' });
            }

            // 3. GRAPH TRANSFORMATION (Replicates GraphRoleClaimsTransformation.cs)
            const extName = getExtAttributeName();
            let userGraphData = null;

            // Strategy A: Try by OID (Preferred)
            const oid = decoded.oid;
            if (oid) {
                try {
                    userGraphData = await graphClient.api(`/users/${oid}`)
                        .select(['id', extName]) // Only fetch what we need
                        .get();
                } catch (e) { console.log('Graph OID lookup failed, trying next...'); }
            }

            // Strategy B: Try by Email (Fallback)
            if (!userGraphData) {
                const email = decoded.emails?.[0] || decoded.email;
                if (email) {
                    try {
                        const result = await graphClient.api('/users')
                            .filter(`identities/any(c:c/issuerAssignedId eq '${email}')`)
                            .select(['id', extName])
                            .get();
                        userGraphData = result.value?.[0];
                    } catch (e) { console.log('Graph Email lookup failed...'); }
                }
            }

            // Strategy C: Try by Display Name (Last Resort)
            if (!userGraphData) {
                const name = decoded.name;
                if (name) {
                    try {
                        const result = await graphClient.api('/users')
                            .filter(`displayName eq '${name}'`)
                            .select(['id', extName])
                            .get();
                        userGraphData = result.value?.[0];
                    } catch (e) { console.log('Graph Name lookup failed...'); }
                }
            }

            // 4. Extract Roles from Graph Data
            let userRoles = [];
            if (userGraphData && userGraphData[extName]) {
                userRoles = decodeRoles(userGraphData[extName]);
            }

            // Attach to Request for use in Controllers
            req.user = {
                id: oid || userGraphData?.id,
                name: decoded.name || 'System',
                roles: userRoles
            };

            console.log(`User: ${req.user.name}, Roles: [${req.user.roles.join(', ')}]`);

            // 5. POLICY CHECK (The [Authorize] part)
            if (requiredRole) {
                // Handle "RequireOpsRole" (Admin, Operator, Officer)
                if (requiredRole === 'RequireOpsRole') {
                    const hasPermission = userRoles.some(r => 
                        [ROLES.Admin, ROLES.Operator, ROLES.Officer].includes(r));
                    if (!hasPermission) return res.status(403).json({ message: 'Forbidden: Requires Ops Role.' });
                }
                // Handle "RequireOperator"
                else if (requiredRole === 'RequireOperator') {
                     const hasPermission = userRoles.some(r => 
                        [ROLES.Admin, ROLES.Operator].includes(r)); // Admin usually has all access
                     if (!hasPermission) return res.status(403).json({ message: 'Forbidden: Requires Operator access.' });
                }
                // Exact Role Match
                else if (!userRoles.includes(requiredRole) && !userRoles.includes(ROLES.Admin)) {
                    return res.status(403).json({ message: `Forbidden: Requires ${requiredRole} role.` });
                }
            }

            next(); // Proceed to Controller

        } catch (err) {
            console.error('Auth Middleware Error:', err.message);
            return res.status(500).json({ message: 'Internal Server Authentication Error' });
        }
    };
};

module.exports = requireAuth;