const mongoose = require('mongoose');
const VesselVisitExecution = require('../../src/models/domain/vesselVisitExecutions/vesselVisitExecution');

describe('3.1 SUT=Class: VesselVisitExecution Domain', () => {
    
    it('should default status to InProgress', () => {
        const vve = new VesselVisitExecution({
            vesselVisitId: 'vv-1',
            vesselIMO: '1234567',
            actualArrivalTime: new Date()
        });
        expect(vve.status).toBe('InProgress');
        expect(vve.executedOperations).toEqual([]);
    });

    it('complete() method should set status to Completed and set timestamp', () => {
        const vve = new VesselVisitExecution({ status: 'InProgress' });
        
        vve.complete();
        
        expect(vve.status).toBe('Completed');
        expect(vve.completedTime).toBeDefined();
        expect(vve.completedTime).toBeInstanceOf(Date);
    });

    it('should require vesselVisitId and actualArrivalTime', () => {
        const vve = new VesselVisitExecution({}); // Empty
        
        const err = vve.validateSync();
        expect(err.errors.vesselVisitId).toBeDefined();
        expect(err.errors.actualArrivalTime).toBeDefined();
    });
});