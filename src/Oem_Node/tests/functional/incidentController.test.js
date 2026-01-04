const request = require('supertest');
const express = require('express');
const incidentController = require('../../src/controllers/incidentController');
const service = require('../../src/models/application/services/incidentService');

jest.mock('../../src/models/application/services/incidentService');

const app = express();
app.use(express.json());

// Bind Routes manually
app.post('/api/incidents/types', incidentController.createType);
app.get('/api/incidents/types', incidentController.getAllTypes);
app.post('/api/incidents', incidentController.createIncident);
app.put('/api/incidents/:id', incidentController.updateIncident);

describe('3.3 SUT=Application: Incident Controller', () => {

    // Dummy user middleware
    app.use((req, res, next) => { req.user = { name: 'TestUser' }; next(); });

    it('POST /types should return 409 if code exists', async () => {
        // Simulate duplicate error
        const err = new Error('duplicate key error');
        err.code = 11000;
        service.createType.mockRejectedValue(err);

        const res = await request(app).post('/api/incidents/types').send({ code: 'DUPE', name: 'Test' });
        expect(res.statusCode).toBe(409);
    });

    it('POST /incidents should return 201 on success', async () => {
        service.createIncident.mockResolvedValue({ id: 'inc-1' });

        const res = await request(app).post('/api/incidents').send({ startTime: '2025-01-01' });
        expect(res.statusCode).toBe(201);
    });

    it('PUT /incidents/:id should return 400 if already resolved', async () => {
        // Mock existing as Resolved
        service.getIncidentById.mockResolvedValue({ status: 'Resolved' });

        const res = await request(app).put('/api/incidents/1').send({ description: 'Edit' });
        expect(res.statusCode).toBe(400);
        expect(res.text).toContain('already Resolved');
    });

    it('PUT /incidents/:id should return 200 if active', async () => {
        service.getIncidentById.mockResolvedValue({ status: 'Active' });
        service.updateIncident.mockResolvedValue({ id: '1', status: 'Active' });

        const res = await request(app).put('/api/incidents/1').send({ description: 'Edit' });
        expect(res.statusCode).toBe(200);
    });
});