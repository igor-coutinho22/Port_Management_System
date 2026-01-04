const service = require('../../src/models/application/services/vesselVisitExecutionService');
const repository = require('../../src/models/infrastructure/repositories/vesselVisitExecutionRepository');
const webAppService = require('../../src/models/infrastructure/integration/webAppService');
const operationPlanRepository = require('../../src/models/infrastructure/repositories/operationPlanRepository');

// Mock dependencies
jest.mock('../../src/models/infrastructure/repositories/vesselVisitExecutionRepository');
jest.mock('../../src/models/infrastructure/integration/webAppService');
jest.mock('../../src/models/infrastructure/repositories/operationPlanRepository');

describe('3.2 SUT=Aggregate: VesselVisitExecution Service', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('createVesselVisitExecution should throw if VVE already exists', async () => {
        repository.getByVesselVisitIdAsync.mockResolvedValue({ id: 'existing' });

        await expect(service.createVesselVisitExecution({ vesselVisitId: 'v1' }, 'token'))
            .rejects.toThrow('already started');
    });

    it('createVesselVisitExecution should throw if Dock is invalid', async () => {
        repository.getByVesselVisitIdAsync.mockResolvedValue(null);
        webAppService.isDockValid.mockResolvedValue(false); // Invalid Dock

        const entity = { vesselVisitId: 'v1', dockId: 'invalid-dock' };
        
        await expect(service.createVesselVisitExecution(entity, 'token'))
            .rejects.toThrow('does not exist');
    });

    it('updateVesselVisitExecution should throw if updating a Completed VVE without admin override', async () => {
        repository.getByIdAsync.mockResolvedValue({ status: 'Completed' });

        await expect(service.updateVesselVisitExecution('id', { dockId: 'd2' }, 'token'))
            .rejects.toThrow('Cannot update a completed');
    });

    it('completeVesselVisitExecution should throw if there are pending operations', async () => {
        repository.getByIdAsync.mockResolvedValue({
            status: 'InProgress',
            executedOperations: [{ status: 'Pending' }] // One pending op
        });

        await expect(service.completeVesselVisitExecution('id', {}, 'token'))
            .rejects.toThrow('unfinished operations');
    });

    it('getPlannedOperations should return items matching VisitID from Approved Plan', async () => {
        // Mock finding an execution
        repository.getByIdAsync.mockResolvedValue({ 
            vesselVisitId: 'target-vvn', 
            actualArrivalTime: new Date('2025-01-01') 
        });

        // Mock OperationPlanRepo finding a plan
        operationPlanRepository.searchPlansAsync.mockResolvedValue([{
            status: 'Approved',
            items: [{ itemId: 'op1', vesselVisitId: 'target-vvn', operationType: 'Loading' }]
        }]);

        const result = await service.getPlannedOperations('vve-id');

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('op1');
        expect(result[0].type).toBe('Loading');
    });
});