const service = require('../../src/models/application/services/operationPlanService');
const repository = require('../../src/models/infrastructure/repositories/operationPlanRepository');
const webAppService = require('../../src/models/infrastructure/integration/webAppService');
const OperationPlan = require('../../src/models/domain/operationPlans/operationPlan');
const OperationPlanStatus = require('../../src/models/domain/operationPlans/enums/operationPlanStatus');

jest.mock('../../src/models/infrastructure/repositories/operationPlanRepository');
jest.mock('../../src/models/infrastructure/integration/webAppService');

describe('3.2 SUT=Aggregate: OperationPlan Service', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('savePlan should throw if plan with ID already exists', async () => {
        repository.getByIdAsync.mockResolvedValue({ id: '123' }); // Exists
        
        await expect(service.savePlan({ id: '123' }))
            .rejects.toThrow('already exists');
    });

    it('savePlan should call repository.addAsync if new', async () => {
        repository.getByIdAsync.mockResolvedValue(null); // New
        
        const plan = { id: 'new-1' };
        await service.savePlan(plan);
        
        expect(repository.addAsync).toHaveBeenCalledWith(plan);
    });

    it('updatePlan should throw if plan is Executed', async () => {
        repository.getByIdAsync.mockResolvedValue({ status: OperationPlanStatus.Executed });
        
        await expect(service.updatePlan('123', {}))
            .rejects.toThrow('already been executed');
    });

    it('getMissingPlanVVNs should return visits not in any plan', async () => {
        // 1. WebApp returns 2 visits
        const visits = [{ id: 'v1' }, { id: 'v2' }];
        webAppService.getApprovedVisitsForDate.mockResolvedValue(visits);

        // 2. Repo returns 1 plan containing 'v1'
        repository.searchPlansAsync.mockResolvedValue([
            { status: OperationPlanStatus.Approved, items: [{ vesselVisitId: 'v1' }] }
        ]);

        // 3. Result should be only 'v2'
        const result = await service.getMissingPlanVVNs('2025-01-01', 'token');
        
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('v2');
    });
});