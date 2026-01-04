const mongoose = require('mongoose');
const ComplementaryTask = require('../../src/models/domain/complementaryTasks/complementaryTask');
const ComplementaryTaskCategory = require('../../src/models/domain/complementaryTasks/complementaryTaskCategory');

describe('3.1 SUT=Class: ComplementaryTask Domain', () => {
    
    // --- CATEGORY TESTS ---
    it('Category should validate code format (Regex)', () => {
        const invalidCategory = new ComplementaryTaskCategory({ 
            code: 'bad code', // Spaces not allowed
            name: 'Test',
            expectedImpact: 'Parallel'
        });
        
        const err = invalidCategory.validateSync();
        expect(err.errors.code).toBeDefined();
    });

    it('Category should accept valid code', () => {
        const validCategory = new ComplementaryTaskCategory({ 
            code: 'TEST-01', 
            name: 'Test',
            expectedImpact: 'Parallel'
        });
        
        const err = validCategory.validateSync();
        expect(err).toBeUndefined();
    });

    it('Category should default expectedImpact to Parallel', () => {
        const category = new ComplementaryTaskCategory({ code: 'T-01', name: 'T' });
        expect(category.expectedImpact).toBe('Parallel');
    });

    // --- TASK TESTS ---
    it('Task should calculate duration virtual property', () => {
        const start = new Date('2025-01-01T10:00:00Z');
        const end = new Date('2025-01-01T12:00:00Z');
        
        const task = new ComplementaryTask({
            complementaryTaskCategoryId: new mongoose.Types.ObjectId(),
            vesselVisitExecutionId: 'vve-1',
            responsibleTeam: 'Team A',
            startTime: start,
            endTime: end
        });

        // 120 minutes difference
        expect(task.duration).toBe(120);
    });

    it('Task should default status to Ongoing', () => {
        const task = new ComplementaryTask({ startTime: new Date() });
        expect(task.status).toBe('Ongoing');
    });
});