describe('3D Visualization Tests', () => {
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

    it('should load 3D view canvas', () => {
        cy.visit('/#3d-view', { onBeforeLoad: mockMsal });
        cy.wait('@getMe');
        // Canvas is usually in a specific container
        cy.get('canvas').should('exist');
        // Ensure no WebGL errors are immediately popping up (simple check)
        cy.get('body').should('not.contain', 'WebGL not supported');
        cy.screenshot('visual-3d-view');
    });
});
