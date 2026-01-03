describe('Incidents Module Tests', () => {
    beforeEach(() => {
        // Mock authenticated user
        const user = {
            name: 'Test Admin',
            email: 'admin@test.com',
            roles: ['Admin']
        };

        localStorage.setItem('pm.currentUser.v1', JSON.stringify(user));
        localStorage.setItem('pm.activeRole.v1', 'Admin');

        cy.intercept('GET', '**/api/me', { statusCode: 200, body: user }).as('getMe');
        cy.intercept('GET', '**/api/incidents*', { statusCode: 200, body: [] }).as('getIncidents');
        cy.intercept('GET', '**/api/incidents/types*', { statusCode: 200, body: [] }).as('getIncidentTypes');
    });

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

    it('should load incidents list', () => {
        cy.visit('/#incidents', { onBeforeLoad: mockMsal });
        cy.wait('@getMe');
        cy.get('body').should('contain', 'Incidents');
        // Should have a list or table, or empty state message
        cy.get('body').should('exist');
        cy.screenshot('incidents-list');
    });

    it('should load incident types list', () => {
        cy.visit('/#incident-types', { onBeforeLoad: mockMsal });
        cy.wait('@getMe');
        cy.get('body').should('contain', 'Incident Types');
        cy.get('body').should('exist');
    });
});
