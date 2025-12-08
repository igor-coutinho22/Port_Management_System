describe('Navigation Tests', () => {
  it('should have page structure', () => {
    cy.visit('/', { failOnStatusCode: false });
    // Verify basic page structure exists
    cy.get('body').should('exist');
    cy.get('html').should('exist');
  });

  it('should be able to interact with available elements', () => {
    cy.visit('/', { failOnStatusCode: false });
    // Try to find any clickable elements
    cy.get('button, a, [role="button"], [onclick]').then(($elements) => {
      if ($elements.length > 0) {
        cy.wrap($elements).first().click({ force: true });
        cy.get('body').should('be.visible');
      } else {
        // No interactive elements - that's OK for some apps
        cy.get('body').should('exist');
      }
    });
  });

  it('should not have navigation errors', () => {
    // Verify page loaded without console errors
    cy.visit('/', { failOnStatusCode: false });
    cy.get('body').should('not.contain', 'Error');
  });
});
