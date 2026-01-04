const privacyService = require('../../src/models/application/services/privacyPolicyService');
// Adjust path to match your structure
const PrivacyPolicy = require('../../src/models/domain/privacy/privacyPolicy');

// FIX: Removed the bad "const mongoose = require('PrivacyPolicy')" line.
// We don't need real mongoose here because we are mocking it.

// Mock the Mongoose Model so we don't hit the DB
jest.mock('../../src/models/domain/privacy/privacyPolicy');

describe('3.2 SUT=Aggregate: PrivacyService', () => {
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('getLatestPolicy should return the most recent policy', async () => {
        const mockPolicy = { content: 'Latest Policy', version: '1.2' };
        
        // Mock chain: .findOne().sort()
        PrivacyPolicy.findOne.mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockPolicy)
        });

        const result = await privacyService.getLatestPolicy();
        
        expect(result).toEqual(mockPolicy);
        expect(PrivacyPolicy.findOne).toHaveBeenCalled();
    });

    it('publishNewPolicy should create a new document', async () => {
        const mockSave = jest.fn().mockResolvedValue({ 
            adminId: 'Admin1', 
            content: 'New Text', 
            version: 'v1' 
        });

        // Mock the constructor behavior
        PrivacyPolicy.mockImplementation(() => ({
            save: mockSave
        }));

        const result = await privacyService.publishNewPolicy('Admin1', 'New Text');

        expect(mockSave).toHaveBeenCalled();
        expect(result.content).toBe('New Text');
    });
});