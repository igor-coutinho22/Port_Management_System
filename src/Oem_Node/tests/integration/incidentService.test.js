const service = require('../../src/models/application/services/incidentService');
const repository = require('../../src/models/infrastructure/repositories/incidentRepository');
const Incident = require('../../src/models/domain/incidents/incident');

// Mock dependencies
jest.mock('../../src/models/infrastructure/repositories/incidentRepository');

// Mock the VVE model directly since Service uses it for search
const VesselVisitExecution = require('../../src/models/domain/vesselVisitExecutions/vesselVisitExecution');
jest.mock('../../src/models/domain/vesselVisitExecutions/vesselVisitExecution');

describe('3.2 SUT=Aggregate: Incident Service', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    // --- TYPE TESTS ---
    it('createType should throw if code format is invalid', async () => {
        const invalidData = { code: 'bad code', name: 'Test' };
        await expect(service.createType(invalidData))
            .rejects.toThrow('Invalid Code Format');
    });

    it('updateType should throw if trying to change code', async () => {
        await expect(service.updateType('id', { code: 'NEW-CODE' }))
            .rejects.toThrow('Incident Type Code cannot be changed');
    });

    // --- INCIDENT TESTS ---
    it('createIncident should default status to Active', async () => {
        // Mock Repo creation
        const mockCreated = { _id: '1', status: 'Active' };
        repository.createIncidentAsync.mockResolvedValue(mockCreated);
        repository.getIncidentByIdAsync.mockResolvedValue(mockCreated); // Populate call

        const data = { startTime: new Date(), incidentTypeId: 'type1' };
        const result = await service.createIncident(data, { name: 'Admin' });

        expect(repository.createIncidentAsync).toHaveBeenCalledWith(expect.objectContaining({
            status: 'Active',
            createdBy: 'Admin'
        }));
    });

    it('updateIncident should auto-set endTime if status becomes Resolved', async () => {
        // Mock update
        repository.updateIncidentAsync.mockImplementation((id, data) => Promise.resolve(data));

        const data = { status: 'Resolved' };
        await service.updateIncident('1', data, {});

        expect(repository.updateIncidentAsync).toHaveBeenCalledWith('1', expect.objectContaining({
            endTime: expect.any(Date)
        }));
    });

    it('searchIncidents should map vessel IMO to VVE Ids', async () => {
        // 1. Mock VVE Search find
        VesselVisitExecution.find.mockReturnValue({
            select: jest.fn().mockResolvedValue([{ _id: 'vve-1' }])
        });

        // 2. Mock Incident Search
        repository.findIncidentsAsync.mockResolvedValue([]);

        await service.searchIncidents({ vessel: 'IMO123' });

        // 3. Verify VVE lookup happened
        expect(VesselVisitExecution.find).toHaveBeenCalled();
        // 4. Verify Incident Repo was called with the ID from VVE
        expect(repository.findIncidentsAsync).toHaveBeenCalledWith(expect.objectContaining({
            affectedVesselVisitIds: { $in: ['vve-1'] }
        }));
    });
});