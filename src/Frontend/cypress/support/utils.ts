/**
 * Cypress Test Utilities and Helpers
 * Reusable functions for common test scenarios
 */

// Add custom commands with proper typing
Cypress.Commands.add('waitForAPI', (timeout = 5000) => {
  cy.intercept('**/api/**').as('apiCall');
});

Cypress.Commands.add('checkPageLoaded', () => {
  cy.get('body').should('be.visible');
  cy.get('html').should('exist');
});

Cypress.Commands.add('takeScreenshot', (name: string) => {
  cy.screenshot(name);
});

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      waitForAPI(timeout?: number): Chainable<void>;
      checkPageLoaded(): Chainable<void>;
      takeScreenshot(name: string): Chainable<void>;
    }
  }
}

export {};
