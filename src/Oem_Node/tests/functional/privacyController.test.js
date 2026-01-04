const request = require('supertest');
const express = require('express');
const privacyRoutes = require('../../src/routes/privacyPolicyRoutes');
const privacyService = require('../../src/models/application/services/privacyPolicyService');

// Mock the Service to isolate the Controller
jest.mock('../../src/models/application/services/privacyPolicyService');
// Mock Auth Middleware to bypass login check
jest.mock('../../src/middleware/authMiddleware', () => () => (req, res, next) => {
    req.user = { id: 'admin-mock', name: 'Mock Admin' }; // Fake logged in user
    next();
});

const app = express();
app.use(express.json());
app.use('/api/privacy', privacyRoutes);

describe('3.3 SUT=Application: Privacy Controller', () => {

    it('GET /latest should return 200 and data', async () => {
        const mockData = { content: 'Public Policy' };
        privacyService.getLatestPolicy.mockResolvedValue(mockData);

        const res = await request(app).get('/api/privacy/latest');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockData);
    });

    it('GET /latest should handle missing policy gracefully', async () => {
        privacyService.getLatestPolicy.mockResolvedValue(null);

        const res = await request(app).get('/api/privacy/latest');

        expect(res.statusCode).toBe(200);
        expect(res.body.content).toContain('No privacy policy published');
    });

    it('POST / should create policy (Admin Only)', async () => {
        const newPolicy = { content: 'New Rules' };
        privacyService.publishNewPolicy.mockResolvedValue(newPolicy);

        const res = await request(app)
            .post('/api/privacy')
            .send(newPolicy);

        expect(res.statusCode).toBe(201);
        expect(privacyService.publishNewPolicy).toHaveBeenCalledWith(expect.any(String), 'New Rules');
    });
});