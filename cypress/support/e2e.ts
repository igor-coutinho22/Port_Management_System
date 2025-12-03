// Cypress E2E support file
// This file runs before each spec file

// Import commands
import './commands';
import './utils';

// Disable uncaught exception handling for development (optional)
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // Modify based on your error handling needs
  return false;
});

// Note: Do NOT automatically visit('/') here
// Let individual tests handle navigation
// This allows tests to work with authentication redirects
