const request = require('supertest');
const express = require('express');
const operationPlanController = require('../../src/controllers/operationPlanController');
const service = require('../../src/models/application/services/operationPlanService');
const webAppService = require('../../src/models/infrastructure/integration/webAppService');

jest.mock('../../src/models/application/services/operationPlanService');
jest.mock('../../src/models/infrastructure/integration/webAppService');

const app = express();
app.use(express.json());

// Manually bind routes since you didn't paste the route file
app.post('/api/operationplan', operationPlanController.savePlan);
app.get('/api/operationplan/GetById/:id', operationPlanController.getPlanById);
app.put('/api/operationplan/approve', operationPlanController.approvePlan);

describe('3.3 SUT=Application: OperationPlan Controller', () => {

    // Dummy user middleware
    app.use((req, res, next) => { req.user = { name: 'TestUser' }; next(); });

    it('GET /GetById/:id should return 404 if not found', async () => {
        service.getPlanById.mockResolvedValue(null);
        
        const res = await request(app).get('/api/operationplan/GetById/999');
        
        expect(res.statusCode).toBe(404);
        expect(res.text).toContain('No operation plan found');
    });

    it('POST / should create plan and return 201', async () => {
        webAppService.getApprovedVisitsForDate.mockResolvedValue([]); // No visits
        service.savePlan.mockResolvedValue(); // Success

        const body = { scheduleDate: '2025-01-01', items: [] };
        
        const res = await request(app).post('/api/operationplan').send(body);
        
        expect(res.statusCode).toBe(201);
    });

    it('PUT /approve should return 204 on success', async () => {
        service.approvePlan.mockResolvedValue();
        
        const res = await request(app).put('/api/operationplan/approve').send({ id: '123' });
        
        expect(res.statusCode).toBe(204);
    });
});