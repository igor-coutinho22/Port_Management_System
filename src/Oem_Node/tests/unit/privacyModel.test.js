const mongoose = require('mongoose');
// Verify this path matches your structure (it seems you have it inside domain/privacy)
const PrivacyPolicy = require('../../src/models/domain/privacy/privacyPolicy'); 

describe('3.1 SUT=Class: PrivacyPolicy Model', () => {
    
    it('should validate that content is required', () => {
        const policy = new PrivacyPolicy({ adminId: 'admin1' }); // Missing content
        
        const err = policy.validateSync();
        expect(err.errors.content).toBeDefined();
        
        // FIX: Match the CUSTOM error message your model actually returns
        expect(err.errors.content.message).toBe('Policy content is required'); 
    });

    it('should validate that adminId is required', () => {
        const policy = new PrivacyPolicy({ content: 'Legal text...' }); 
        
        const err = policy.validateSync();
        expect(err.errors.adminId).toBeDefined();
    });

    it('should accept valid data', () => {
        const policy = new PrivacyPolicy({ 
            content: 'Valid Policy', 
            adminId: 'System Admin' 
        });
        
        const err = policy.validateSync();
        expect(err).toBeUndefined(); 
    });
});