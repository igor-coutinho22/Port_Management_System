describe('Incident Management (E2E)', () => {
    const user = { name: 'Test Admin', email: 'admin@test.com', roles: ['Admin'] };

    const mockMsal = (win) => {
        win.__pca = {
            getAllAccounts: () => [{ username: 'test_admin', homeAccountId: '1' }],
            getActiveAccount: () => ({ username: 'test_admin', homeAccountId: '1' }),
            setActiveAccount: () => { },
            handleRedirectPromise: () => Promise.resolve(null),
            addEventCallback: () => null,
            removeEventCallback: () => null,
            acquireTokenSilent: () => Promise.resolve({ accessToken: 'mock_token' }),
            acquireTokenRedirect: () => Promise.resolve()
        };
        win.__msalReady = Promise.resolve();
    };

    beforeEach(() => {
        localStorage.setItem('pm.currentUser.v1', JSON.stringify(user));
        localStorage.setItem('pm.activeRole.v1', 'Admin');

        // Mock API responses to isolate the Frontend (SUT = Application)
        cy.intercept('GET', '**/api/me', { statusCode: 200, body: user }).as('getMe');
        cy.intercept('GET', '**/api/user-profiles/privacy-status', { statusCode: 200, body: { mustAcceptPrivacy: false } });
        cy.intercept('GET', '**/api/vesselVisitExecution/GetAll', { statusCode: 200, body: [] });
        cy.intercept('GET', '**/api/incidents/Search*', {
            statusCode: 200,
            body: [
                {
                    id: 'inc-1',
                    description: 'Oil spill at Dock 1',
                    startTime: '2023-01-01T10:00:00Z',
                    status: 'Active',
                    severity: 'High',
                },
            ],
        }).as('searchIncidents');
        cy.intercept('GET', '**/api/incidents/types/all', {
            statusCode: 200,
            body: [{ id: 'type-1', code: 'SPL', name: 'Spill' }],
        }).as('getTypes');
        cy.intercept('POST', '**/api/incidents', {
            statusCode: 201,
            body: { id: 'inc-new', description: 'New Incident' },
        }).as('createIncident');

        cy.visit('/#incidents', { onBeforeLoad: mockMsal });
        // The SPA is compiled in the browser (Babel standalone), so the first load can be slow
        cy.wait('@getMe', { timeout: 30000 });
    });

    it('should list existing incidents', () => {
        cy.get('.quick-view-btn').click();
        cy.wait('@searchIncidents');
        cy.contains('Oil spill at Dock 1').should('be.visible');
    });

    it('should allow creating a new incident', () => {
        cy.contains('.operation-title', 'Report New Incident').click();
        cy.wait('@getTypes');

        cy.get('select[name="incidentTypeId"]').select('type-1');
        cy.get('input[name="startTime"]').type('2024-05-01T10:30');
        cy.get('textarea[name="description"]').type('New Incident');
        cy.get('button[type="submit"]').click();

        cy.wait('@createIncident').its('request.body').should('include', {
            incidentTypeId: 'type-1',
            description: 'New Incident',
        });
        cy.contains('Incident Reported Successfully').should('exist');
    });
});
