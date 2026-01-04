const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const operationPlanController = require('../../src/controllers/operationPlanController');
const OperationPlan = require('../../src/models/domain/operationPlans/operationPlan'); // Real Model

// Real App Setup
const app = express();
app.use(express.json());
// Mock WebAppService because it calls external API
jest.mock('../../src/models/infrastructure/integration/webAppService', () => ({
    getApprovedVisitsForDate: jest.fn().mockResolvedValue([]),
    isVesselValid: jest.fn().mockResolvedValue(true)
}));

app.post('/api/operationplan', operationPlanController.savePlan);
app.get('/api/operationplan/GetAll', operationPlanController.getAllPlans);

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('3.4 SUT=System: OperationPlan Flow', () => {

    it('Should save a plan and retrieve it', async () => {
        // 1. Create
        const body = { scheduleDate: '2025-05-20', items: [] };
        const postRes = await request(app).post('/api/operationplan').send(body);
        expect(postRes.statusCode).toBe(201);

        // 2. Retrieve
        const getRes = await request(app).get('/api/operationplan/GetAll');
        expect(getRes.statusCode).toBe(200);
        expect(getRes.body.length).toBeGreaterThan(0);
        expect(getRes.body[0].scheduleDate).toContain('2025-05-20');
    });
});