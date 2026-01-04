const mongoose = require('mongoose');
const OperationPlan = require('../../src/models/domain/operationPlans/operationPlan');
const OperationPlanStatus = require('../../src/models/domain/operationPlans/enums/operationPlanStatus');
const PlanItemUpdateInfo = require('../../src/models/domain/operationPlans/planItemUpdateInfo'); // Check path

describe('3.1 SUT=Class: OperationPlan Domain', () => {
    
    it('should default status to Draft', () => {
        const plan = new OperationPlan({ scheduleDate: new Date() });
        expect(plan.status).toBe(OperationPlanStatus.Draft);
    });

    it('approvePlan should change status from Draft to Approved', () => {
        const plan = new OperationPlan({ status: OperationPlanStatus.Draft });
        plan.approvePlan();
        expect(plan.status).toBe(OperationPlanStatus.Approved);
    });

    it('approvePlan should throw if not Draft', () => {
        const plan = new OperationPlan({ status: OperationPlanStatus.Approved });
        expect(() => plan.approvePlan()).toThrow('Only draft plans can be approved.');
    });

    it('updateItem should throw if new resource usage exceeds MAX limits', () => {
        // Mock a plan with an existing item using 15 cranes
        const plan = new OperationPlan({ 
            items: [{ 
                _id: 'item1', 
                serviceStartTime: new Date('2025-01-01T10:00:00Z'),
                serviceEndTime: new Date('2025-01-01T12:00:00Z'),
                numberOfCranes: 15,
                numberOfStaff: 10
            }]
        });

        // Try to update another item to overlap and use 10 cranes (Total 25 > 20 Limit)
        const updateInfo = {
            itemId: 'item2', // This doesn't exist yet, but logic checks overlap first usually
            serviceStartTime: new Date('2025-01-01T10:00:00Z'),
            serviceEndTime: new Date('2025-01-01T11:00:00Z'),
            numberOfCranes: 10,
            numberOfStaff: 5
        };

        // Note: In your logic, it finds the item first. So we need to add item2 to the plan first.
        plan.items.push({ _id: 'item2', serviceStartTime: new Date(), serviceEndTime: new Date(), numberOfCranes: 0, numberOfStaff: 0 });

        expect(() => plan.updateItem(updateInfo, 'Tester', 'Reason'))
            .toThrow(/Resource Conflict/);
    });
});