describe('Management Module Tests', () => {
    beforeEach(() => {
        // Mock authenticated user
        const user = {
            name: 'Test Admin',
            email: 'admin@test.com',
            roles: ['Admin']
        };

        // Inject into localStorage
        localStorage.setItem('pm.currentUser.v1', JSON.stringify(user));
        localStorage.setItem('pm.activeRole.v1', 'Admin');

        // Mock API calls
        cy.intercept('GET', '**/api/me', { statusCode: 200, body: user }).as('getMe');
        cy.intercept('GET', '**/api/vessels*', { statusCode: 200, body: [] }).as('getVessels');
        cy.intercept('GET', '**/api/staff*', { statusCode: 200, body: [] }).as('getStaff');
        cy.intercept('GET', '**/api/resources*', { statusCode: 200, body: [] }).as('getResources');
        cy.intercept('GET', '**/api/docks*', { statusCode: 200, body: [] }).as('getDocks');
    });

    const mockMsal = (win) => {
        win.__pca = {
            getAllAccounts: () => [{ username: 'test_admin', homeAccountId: '1', environment: 'login.windows.net', tenantId: '1' }],
            getActiveAccount: () => ({ username: 'test_admin', homeAccountId: '1' }),
            setActiveAccount: () => { },
            handleRedirectPromise: () => Promise.resolve(null),
            addEventCallback: () => null,
            removeEventCallback: () => null,
            acquireTokenSilent: () => Promise.resolve({ accessToken: 'mock_token' }),
            acquireTokenRedirect: () => Promise.resolve()
        };
        win.__msalReady = Promise.resolve(); // Required for AuthGate
    };

    it('should load management dashboard', () => {
        cy.visit('/#management', { onBeforeLoad: mockMsal });
        cy.wait('@getMe');
        cy.get('body').should('contain', 'Management');
        cy.get('#app').should('exist');
        cy.screenshot('management-dashboard');
    });

    it('should navigate to Vessels hub', () => {
        cy.visit('/#vessels', { onBeforeLoad: mockMsal });
        cy.wait('@getMe');
        cy.get('body').should('contain', 'Vessels');
        cy.get('body').should('exist');
    });

    it('should navigate to Staff hub', () => {
        cy.visit('/#staff', { onBeforeLoad: mockMsal });
        cy.wait('@getMe');
        cy.get('body').should('contain', 'Staff');
    });

    it('should navigate to Resources hub', () => {
        cy.visit('/#resources', { onBeforeLoad: mockMsal });
        cy.wait('@getMe');
        cy.get('body').should('contain', 'Resources');
    });

    it('should navigate to Docks hub', () => {
        cy.visit('/#docks', { onBeforeLoad: mockMsal });
        cy.wait('@getMe');
        cy.get('body').should('contain', 'Docks');
    });
});
