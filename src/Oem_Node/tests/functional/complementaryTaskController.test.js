const request = require('supertest');
const express = require('express');
const controller = require('../../src/controllers/complementaryTaskController');
const service = require('../../src/models/application/services/complementaryTaskService');

jest.mock('../../src/models/application/services/complementaryTaskService');

const app = express();
app.use(express.json());

// Bind Routes
app.post('/api/complementarytasks/categories', controller.createCategory);
app.get('/api/complementarytasks/categories', controller.getAllCategories);
app.post('/api/complementarytasks', controller.createTask);
app.put('/api/complementarytasks/:id', controller.updateTask);

describe('3.3 SUT=Application: ComplementaryTask Controller', () => {

    it('POST /categories should return 409 if duplicate', async () => {
        const err = new Error('duplicate key error');
        service.createCategory.mockRejectedValue(err);

        const res = await request(app).post('/api/complementarytasks/categories').send({ code: 'DUPE' });
        expect(res.statusCode).toBe(409);
    });

    it('POST /categories should return 201 on success', async () => {
        service.createCategory.mockResolvedValue({ id: 'cat-1' });

        const res = await request(app).post('/api/complementarytasks/categories').send({ code: 'NEW', name: 'New' });
        expect(res.statusCode).toBe(201);
    });

    it('POST /tasks should return 400 on validation error', async () => {
        service.createTask.mockRejectedValue(new Error('Category ID is required'));

        const res = await request(app).post('/api/complementarytasks').send({});
        expect(res.statusCode).toBe(400);
    });

    it('PUT /tasks/:id should return 404 if not found', async () => {
        service.updateTask.mockResolvedValue(null);

        const res = await request(app).put('/api/complementarytasks/999').send({ status: 'Completed' });
        expect(res.statusCode).toBe(404);
    });
});