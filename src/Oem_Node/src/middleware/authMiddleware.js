const axios = require('axios');
const jwt = require('jsonwebtoken');
const jwksRsa = require('jwks-rsa');
const graphClient = require('../config/graphClient');

// Token validation settings (Matches the JwtBearer configuration of the WebApp)
const AUTHORITY_HOST = (process.env.AZURE_AUTHORITY_HOST || 'https://sinesport.ciamlogin.com').replace(/\/+$/, '');
const AUTHORITY = `${AUTHORITY_HOST}/${process.env.AZURE_TENANT_ID}/v2.0`;
const AUDIENCES = (process.env.AZURE_API_AUDIENCES || `api://port-management,${process.env.AZURE_CLIENT_ID}`)
    .split(',')
    .map(a => a.trim())
    .filter(a => a.length > 0);

// OpenID metadata (issuer + signing keys) is fetched once and cached
let openIdConfigPromise = null;
const getOpenIdConfig = () => {
    if (!openIdConfigPromise) {
        openIdConfigPromise = axios
            .get(`${AUTHORITY}/.well-known/openid-configuration`)
            .then(res => ({
                issuer: res.data.issuer,
                jwks: jwksRsa({ jwksUri: res.data.jwks_uri, cache: true, rateLimit: true })
            }))
            .catch(err => {
                openIdConfigPromise = null;
                throw err;
            });
    }
    return openIdConfigPromise;
};

// Verifies signature, issuer, audience and lifetime. Throws if the token is not valid.
const verifyToken = async (token) => {
    const { issuer, jwks } = await getOpenIdConfig();
    const getKey = (header, callback) => {
        jwks.getSigningKey(header.kid)
            .then(key => callback(null, key.getPublicKey()))
            .catch(err => callback(err));
    };
    const issuers = [issuer.replace(/\/+$/, ''), `${issuer.replace(/\/+$/, '')}/`];

    return new Promise((resolve, reject) => {
        jwt.verify(token, getKey, { algorithms: ['RS256'], audience: AUDIENCES, issuer: issuers }, (err, decoded) =>
            err ? reject(err) : resolve(decoded));
    });
};

// Escapes a value for use inside an OData string literal
const odataString = (value) => String(value).replace(/'/g, "''");

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

            // 2. Validate Token (signature, issuer, audience, lifetime) and get claims
            let decoded;
            try {
                decoded = await verifyToken(token);
            } catch (e) {
                console.warn('JWT validation failed:', e.message);
                return res.status(401).json({ message: 'Invalid token.' });
            }

            // 3. GRAPH TRANSFORMATION (Replicates GraphRoleClaimsTransformation.cs)
            const extName = getExtAttributeName();
            let userGraphData = null;

            // Strategy A: Try by OID (Preferred)
            const oid = decoded.oid;
            if (oid) {
                try {
                    userGraphData = await graphClient.api(`/users/${encodeURIComponent(oid)}`)
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
                            .filter(`identities/any(c:c/issuerAssignedId eq '${odataString(email)}')`)
                            .select(['id', extName])
                            .get();
                        userGraphData = result.value?.[0];
                    } catch (e) { console.log('Graph Email lookup failed...'); }
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