
describe('Incident Management (E2E)', () => {
    beforeEach(() => {
        // Mock API responses to isolate the Frontend (SUT = Application)
        cy.intercept('GET', '**/api/incidents*', {
            statusCode: 200,
            body: [
                {
                    id: 'inc-1',
                    description: 'Oil spill at Dock 1',
                    startTime: '2023-01-01T10:00:00Z',
                    status: 'Open',
                },
            ],
        }).as('getIncidents');

        cy.intercept('POST', '**/api/incidents', {
            statusCode: 201,
            body: {
                id: 'inc-new',
                description: 'New Incident',
            },
        }).as('createIncident');

        cy.intercept('GET', '**/api/incidents/types/all', {
            statusCode: 200,
            body: [{ id: 'type-1', name: 'Spill' }],
        }).as('getTypes');

        // Visit the app
        cy.visit('/#incidents');
    });

    it('should list existing incidents', () => {
        cy.wait('@getIncidents');
        cy.contains('Oil spill at Dock 1').should('be.visible');
    });

    it('should allow creating a new incident', () => {
        // Navigate to Create form (assuming a button exists)
        cy.get('button').contains(/Create|New|Adicionar/i).click();

        // Fill form
        cy.get('input[name="description"], textarea[name="description"]').type('New Incident');
        // Select type if dropdown exists (conceptual)
        // cy.get('select[name="type"]').select('Spill');

        // Submit
        cy.get('button[type="submit"]').click();

        // Verify API call
        cy.wait('@createIncident').its('request.body').should('include', {
            description: 'New Incident',
        });

        // Verify UI update (optimistic or re-fetch)
        // For this test, we assume success message or redirection
        cy.contains(/Success|Criado/i).should('exist');
    });
});
