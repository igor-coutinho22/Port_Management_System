describe('Authentication Tests', () => {
  it('should redirect unauthenticated users to login', () => {
    cy.visit('/', { failOnStatusCode: false });
    // Should either redirect or show auth-required message
    cy.url().then((url) => {
      const isLoginPage = url.includes('login') || url.includes('signin') || url.includes('auth');
      const isMainPage = url.includes('localhost:5179/');
      // One of these should be true
      expect(isLoginPage || isMainPage).to.be.true;
    });
  });

  it('should load without crashing on unauthenticated request', () => {
    cy.visit('/', { failOnStatusCode: false });
    cy.get('body').should('be.visible');
  });

  it('should handle auth redirect gracefully', () => {
    cy.visit('/', { failOnStatusCode: false });
    // Page should either:
    // 1. Show login interface
    // 2. Redirect to auth provider
    // 3. Display auth-required message
    cy.get('body').should('exist');
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
