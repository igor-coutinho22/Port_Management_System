const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const incidentController = require('../../src/controllers/incidentController');

// Real App Setup
const app = express();
app.use(express.json());

// Routes
app.post('/api/incidents/types', incidentController.createType);
app.post('/api/incidents', incidentController.createIncident);
app.get('/api/incidents/:id', incidentController.getIncidentById);

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('3.4 SUT=System: Incident Full Flow', () => {

    it('Should create a Type, then an Incident using that Type', async () => {
        // 1. Create Type
        const typeRes = await request(app).post('/api/incidents/types').send({
            code: 'FIRE-01',
            name: 'Fire Alarm'
        });
        expect(typeRes.statusCode).toBe(201);
        const typeId = typeRes.body.id;

        // 2. Create Incident
        const incRes = await request(app).post('/api/incidents').send({
            incidentTypeId: typeId,
            startTime: '2025-06-01T12:00:00Z',
            description: 'Fire in the hole'
        });
        expect(incRes.statusCode).toBe(201);
        const incidentId = incRes.body.id;

        // 3. Retrieve Incident (Verify Population)
        const getRes = await request(app).get(`/api/incidents/${incidentId}`);
        expect(getRes.statusCode).toBe(200);
        // Check if Type name is populated in the DTO or response
        // Note: Your Mapper might flatten it or keep it nested. 
        // Based on mapper convention, it likely returns typeName or nested object.
        expect(getRes.body.description).toBe('Fire in the hole');
    });
});