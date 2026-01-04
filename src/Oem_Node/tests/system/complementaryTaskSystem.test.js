const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const controller = require('../../src/controllers/complementaryTaskController');

const app = express();
app.use(express.json());

// Routes
app.post('/api/complementarytasks/categories', controller.createCategory);
app.post('/api/complementarytasks', controller.createTask);
app.get('/api/complementarytasks/:id', controller.getTaskById);

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('3.4 SUT=System: ComplementaryTask Full Flow', () => {

    it('Should create a Category and then a Task', async () => {
        // 1. Create Category
        const catRes = await request(app).post('/api/complementarytasks/categories').send({
            code: 'CLEAN-01',
            name: 'Cleaning',
            expectedImpact: 'Parallel'
        });
        expect(catRes.statusCode).toBe(201);
        const catId = catRes.body.id;

        // 2. Create Task
        const taskRes = await request(app).post('/api/complementarytasks').send({
            complementaryTaskCategoryId: catId,
            vesselVisitExecutionId: 'vve-test-1',
            responsibleTeam: 'Cleaners Inc',
            startTime: '2025-06-01T10:00:00Z'
        });
        
        expect(taskRes.statusCode).toBe(201);
        const taskId = taskRes.body.id;

        // 3. Retrieve Task
        const getRes = await request(app).get(`/api/complementarytasks/${taskId}`);
        expect(getRes.statusCode).toBe(200);
        // Verify population works (if mapper supports it) or raw fields
        expect(getRes.body.responsibleTeam).toBe('Cleaners Inc');
    });
});