const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const vveController = require('../../src/controllers/vesselVisitExecutionController');

// Real App Setup
const app = express();
app.use(express.json());

// Routes
app.post('/api/vesselvisitexecution/Create', vveController.create);
app.get('/api/vesselvisitexecution/GetAll', vveController.getAll);

// Mock External WebApp Service
jest.mock('../../src/models/infrastructure/integration/webAppService', () => ({
    getVesselVisitById: jest.fn().mockResolvedValue({ vesselIMO: 'IMO123' }),
    isVesselValid: jest.fn().mockResolvedValue(true),
    isDockValid: jest.fn().mockResolvedValue(true)
}));

// Mock Service (Partial) or use Real Service? 
// System tests should use Real Service. 
// But we need to ensure mocked Repos in previous tests don't interfere.
// Jest isolates test files, so previous mocks won't leak here.

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('3.4 SUT=System: VVE Full Flow', () => {

    it('Should create a VVE and retrieve it', async () => {
        // 1. Create
        const body = { 
            vesselVisitId: 'v-sys-test', 
            vesselIMO: 'IMO123', 
            actualArrivalTime: '2025-06-01T10:00:00Z' 
        };
        
        const createRes = await request(app).post('/api/vesselvisitexecution/Create').send(body);
        
        // If this fails, check if your DTOs/Mappers exist in the project!
        expect(createRes.statusCode).toBe(201);
        expect(createRes.body.vesselVisitId).toBe('v-sys-test');

        // 2. GetAll
        const getRes = await request(app).get('/api/vesselvisitexecution/GetAll');
        expect(getRes.statusCode).toBe(200);
        expect(getRes.body.length).toBeGreaterThan(0);
        expect(getRes.body[0].vesselIMO).toBe('IMO123');
    });
});