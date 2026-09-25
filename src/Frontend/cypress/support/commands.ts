// Custom commands for Cypress
// Add reusable commands here

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/');
  cy.contains('button', /login|sign in/i).click();
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.contains('button', /login|sign in/i).click();
  cy.url().should('not.include', '/login');
});

Cypress.Commands.add('logout', () => {
  cy.contains('button', /logout|sign out/i).click();
  cy.url().should('include', '/');
});

// Extend Cypress chainable commands
declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
    }
  }
}

export {};
