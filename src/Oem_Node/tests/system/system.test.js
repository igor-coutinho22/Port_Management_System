const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const privacyRoutes = require('../../src/routes/privacyPolicyRoutes');

// REAL APP SETUP (No Mocks for Service/Repo)
// Only Mock Auth because MSAL is external
jest.mock('../../src/middleware/authMiddleware', () => () => (req, res, next) => {
    req.user = { id: 'system-test-user', name: 'System Tester' };
    next();
});

const app = express();
app.use(express.json());
app.use('/api/privacy', privacyRoutes);

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('3.4 SUT=System: Full Privacy API Flow', () => {

    it('Full Flow: Publish Policy -> Retrieve It', async () => {
        // 1. Initially it should be empty
        const initialRes = await request(app).get('/api/privacy/latest');
        expect(initialRes.body.content).toContain('No privacy policy');

        // 2. Publish a new policy (System Test)
        const publishRes = await request(app)
            .post('/api/privacy')
            .send({ content: 'System Test Content' });
        
        expect(publishRes.statusCode).toBe(201);
        expect(publishRes.body.content).toBe('System Test Content');

        // 3. Retrieve it again to verify persistence
        const finalRes = await request(app).get('/api/privacy/latest');
        expect(finalRes.statusCode).toBe(200);
        expect(finalRes.body.content).toBe('System Test Content');
        // This proves Controller -> Service -> DB -> Controller works!
    });
});