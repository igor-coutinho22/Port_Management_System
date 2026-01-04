const service = require('../../src/models/application/services/complementaryTaskService');
const repository = require('../../src/models/infrastructure/repositories/complementaryTaskRepository');
const VesselVisitExecution = require('../../src/models/domain/vesselVisitExecutions/vesselVisitExecution');

// Mock dependencies
jest.mock('../../src/models/infrastructure/repositories/complementaryTaskRepository');
jest.mock('../../src/models/domain/vesselVisitExecutions/vesselVisitExecution');

describe('3.2 SUT=Aggregate: ComplementaryTask Service', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    // --- CATEGORY TESTS ---
    it('createCategory should throw if code is missing', async () => {
        await expect(service.createCategory({ name: 'Test' }))
            .rejects.toThrow('Code and Name are required');
    });

    it('updateCategory should remove code from update data (Immutability)', async () => {
        // Mock success
        repository.updateCategoryAsync.mockResolvedValue({ _id: '1', code: 'OLD' });

        const updateData = { code: 'NEW', name: 'Updated Name' };
        await service.updateCategory('1', updateData);

        // Verify repository was called WITHOUT 'code'
        expect(repository.updateCategoryAsync).toHaveBeenCalledWith('1', { name: 'Updated Name' });
    });

    // --- TASK TESTS ---
    it('createTask should validate required fields', async () => {
        await expect(service.createTask({}))
            .rejects.toThrow('Category ID is required');
    });

    it('updateTask should auto-set endTime if status becomes Completed', async () => {
        // Mock update
        repository.updateTaskAsync.mockImplementation((id, data) => Promise.resolve({ ...data, _id: id }));
        repository.getTaskByIdAsync.mockResolvedValue({}); // Populate mock

        await service.updateTask('1', { status: 'Completed' });

        expect(repository.updateTaskAsync).toHaveBeenCalledWith('1', expect.objectContaining({
            endTime: expect.any(Date)
        }));
    });

    it('updateTask should clear endTime if status becomes Ongoing', async () => {
        repository.updateTaskAsync.mockImplementation((id, data) => Promise.resolve({ ...data, _id: id }));
        repository.getTaskByIdAsync.mockResolvedValue({}); 

        await service.updateTask('1', { status: 'Ongoing' });

        expect(repository.updateTaskAsync).toHaveBeenCalledWith('1', expect.objectContaining({
            endTime: null
        }));
    });

    it('searchTasks should map vessel name to VVE Ids', async () => {
        // 1. Mock VVE Search
        VesselVisitExecution.find.mockReturnValue({
            select: jest.fn().mockResolvedValue([{ _id: 'vve-1' }])
        });

        // 2. Mock Task Search
        repository.findTasksAsync.mockResolvedValue([]);

        await service.searchTasks({ vessel: 'MyVessel' });

        expect(VesselVisitExecution.find).toHaveBeenCalled();
        expect(repository.findTasksAsync).toHaveBeenCalledWith(expect.objectContaining({
            vesselVisitExecutionId: { $in: ['vve-1'] }
        }));
    });
});