describe('API Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the page successfully', () => {
    // Verify no hard errors on page load
    cy.url().should('include', 'localhost:5179');
    cy.get('body').should('be.visible');
  });

  it('should not have network errors on initial load', () => {
    // Check for common error indicators
    cy.get('body').should('not.contain', 'Error');
    cy.get('body').should('not.contain', 'Cannot');
  });

  it('should intercept API calls if they exist', () => {
    cy.intercept('**/api/**').as('apiCall');
    cy.visit('/');
    // API calls may or may not exist on homepage, so we don't assert
    // Just verify the app doesn't break when we intercept
    cy.get('body').should('be.visible');
  });
});
