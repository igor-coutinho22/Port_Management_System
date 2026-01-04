const mongoose = require('mongoose');
const Incident = require('../../src/models/domain/incidents/incident');
const IncidentType = require('../../src/models/domain/incidents/incidentType');

describe('3.1 SUT=Class: Incident Domain', () => {
    
    // --- INCIDENT TYPE TESTS ---
    it('IncidentType should require code and name', () => {
        const type = new IncidentType({});
        const err = type.validateSync();
        expect(err.errors.code).toBeDefined();
        expect(err.errors.name).toBeDefined();
    });

    it('IncidentType should default severity to Minor', () => {
        const type = new IncidentType({ code: 'TEST-01', name: 'Test' });
        expect(type.severity).toBe('Minor');
    });

    // --- INCIDENT TESTS ---
    it('Incident should calculate duration virtual property', () => {
        const start = new Date('2025-01-01T10:00:00Z');
        const end = new Date('2025-01-01T10:30:00Z');
        
        const incident = new Incident({
            incidentTypeId: new mongoose.Types.ObjectId(),
            startTime: start,
            endTime: end,
            createdBy: 'Tester'
        });

        // 30 minutes difference
        expect(incident.duration).toBe(30);
    });

    it('Incident should default status to Active', () => {
        const incident = new Incident({ startTime: new Date() });
        expect(incident.status).toBe('Active');
    });

    it('Incident duration should be null if endTime is missing', () => {
        const incident = new Incident({ startTime: new Date(), endTime: null });
        expect(incident.duration).toBeNull();
    });
});