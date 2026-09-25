const crypto = require('crypto');
const jwt = require('jsonwebtoken');

process.env.AZURE_AUTHORITY_HOST = 'https://login.example.com';
process.env.AZURE_TENANT_ID = 'tenant-id';
process.env.AZURE_CLIENT_ID = 'api-client-id';
process.env.AZURE_EXTENSIONS_APP_ID = 'extapp';

const ISSUER = 'https://login.example.com/tenant-id/v2.0';
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const mockSigningKey = publicKey.export({ type: 'spki', format: 'pem' });
const { privateKey: otherPrivateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });

jest.mock('axios', () => ({
    get: jest.fn(() => Promise.resolve({
        data: { issuer: 'https://login.example.com/tenant-id/v2.0', jwks_uri: 'https://login.example.com/keys' }
    }))
}));

jest.mock('jwks-rsa', () => () => ({
    getSigningKey: () => Promise.resolve({
        getPublicKey: () => mockSigningKey
    })
}));

jest.mock('../../src/config/graphClient', () => ({
    api: () => ({
        select: () => ({ get: () => Promise.resolve({ id: 'user-1', extension_extapp_Role: 'Admin' }) })
    })
}));

const requireAuth = require('../../src/middleware/authMiddleware');

const sign = (claims, options = {}, key = privateKey) =>
    jwt.sign({ oid: 'user-1', name: 'Test User', ...claims }, key, {
        algorithm: 'RS256',
        keyid: 'kid-1',
        issuer: ISSUER,
        audience: 'api://port-management',
        expiresIn: '5m',
        ...options
    });

const run = async (authorization, role = null) => {
    const req = { headers: authorization ? { authorization } : {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    const next = jest.fn();
    await requireAuth(role)(req, res, next);
    return { req, res, next };
};

describe('SUT=Middleware: requireAuth', () => {
    it('should reject requests without a bearer token', async () => {
        const { res, next } = await run(undefined);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('should accept a correctly signed token and load roles from Graph', async () => {
        const { req, next } = await run(`Bearer ${sign({})}`, 'Admin');
        expect(next).toHaveBeenCalled();
        expect(req.user).toEqual({ id: 'user-1', name: 'Test User', roles: ['Admin'] });
    });

    it('should reject an unsigned (alg=none) token', async () => {
        const forged = jwt.sign({ oid: 'user-1', aud: 'api://port-management', iss: ISSUER }, null, { algorithm: 'none' });
        const { res, next } = await run(`Bearer ${forged}`);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('should reject a token signed with a different key', async () => {
        const { res, next } = await run(`Bearer ${sign({}, {}, otherPrivateKey)}`);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('should reject a token issued for another audience', async () => {
        const { res, next } = await run(`Bearer ${sign({}, { audience: 'api://other-app' })}`);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('should reject a token from another issuer', async () => {
        const { res, next } = await run(`Bearer ${sign({}, { issuer: 'https://evil.example.com/v2.0' })}`);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('should reject an expired token', async () => {
        const { res, next } = await run(`Bearer ${sign({}, { expiresIn: -10 })}`);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
});
