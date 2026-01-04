const request = require('supertest');
const express = require('express');
const vveController = require('../../src/controllers/vesselVisitExecutionController');
const service = require('../../src/models/application/services/vesselVisitExecutionService');
const webAppService = require('../../src/models/infrastructure/integration/webAppService');

// Mock Service & WebApp
jest.mock('../../src/models/application/services/vesselVisitExecutionService');
jest.mock('../../src/models/infrastructure/integration/webAppService');

const app = express();
app.use(express.json());

// Bind Routes manually
app.post('/api/vesselvisitexecution/Create', vveController.create);
app.get('/api/vesselvisitexecution/:id', vveController.getById);
app.post('/api/vesselvisitexecution/:id/Complete', vveController.complete);

describe('3.3 SUT=Application: VVE Controller', () => {

    it('POST /Create should return 400 if validation fails', async () => {
        const res = await request(app).post('/api/vesselvisitexecution/Create').send({});
        expect(res.statusCode).toBe(400); // "Invalid data"
    });

    it('POST /Create should return 201 on success', async () => {
        // Mocks to pass the controller's validation logic
        webAppService.getVesselVisitById.mockResolvedValue({ vesselIMO: 'imo1' }); // Matches DTO
        webAppService.isVesselValid.mockResolvedValue(true);
        service.createVesselVisitExecution.mockResolvedValue({ id: 'new-id', status: 'InProgress' });

        const body = { 
            vesselVisitId: 'v1', 
            vesselIMO: 'imo1', 
            actualArrivalTime: '2025-01-01' 
        };

        const res = await request(app).post('/api/vesselvisitexecution/Create').send(body);
        expect(res.statusCode).toBe(201);
    });

    it('GET /:id should return 404 if service returns null', async () => {
        service.getVesselVisitExecutionById.mockResolvedValue(null);
        const res = await request(app).get('/api/vesselvisitexecution/999');
        expect(res.statusCode).toBe(404);
    });

    it('POST /:id/Complete should return 200 on success', async () => {
        service.completeVesselVisitExecution.mockResolvedValue({ status: 'Completed' });

        const body = { unberthTime: '2025-01-02', portDepartureTime: '2025-01-02' };
        const res = await request(app).post('/api/vesselvisitexecution/123/Complete').send(body);
        
        expect(res.statusCode).toBe(200);
    });
});