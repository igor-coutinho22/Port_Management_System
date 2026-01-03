describe('Scheduling Module Tests', () => {
    beforeEach(() => {
        // Mock authenticated user
        const user = {
            name: 'Test Operator',
            email: 'operator@test.com',
            roles: ['Admin', 'Operator']
        };

        localStorage.setItem('pm.currentUser.v1', JSON.stringify(user));
        localStorage.setItem('pm.activeRole.v1', 'Operator');

        cy.intercept('GET', '**/api/me', { statusCode: 200, body: user }).as('getMe');
    });

    const mockMsal = (win) => {
        win.__pca = {
            getAllAccounts: () => [{ username: 'test_operator', homeAccountId: '1' }],
            getActiveAccount: () => ({ username: 'test_operator', homeAccountId: '1' }),
            setActiveAccount: () => { },
            handleRedirectPromise: () => Promise.resolve(null),
            addEventCallback: () => null,
            removeEventCallback: () => null,
            acquireTokenSilent: () => Promise.resolve({ accessToken: 'mock_token' }),
            acquireTokenRedirect: () => Promise.resolve()
        };
        win.__msalReady = Promise.resolve();
    };

    it('should load scheduling dashboard', () => {
        cy.visit('/#scheduling', { onBeforeLoad: mockMsal });
        cy.wait('@getMe');
        cy.get('body').should('be.visible');
        cy.get('body').should('not.contain', 'Access Denied');
        cy.get('body').should('not.contain', 'autenticação é necessária');
        cy.screenshot('scheduling-dashboard');
    });
});
