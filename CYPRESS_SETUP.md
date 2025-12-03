# Cypress E2E Testing Setup

This project includes end-to-end testing using Cypress. Follow these instructions to run tests locally or in CI/CD.

## Prerequisites

- Node.js 18+
- npm
- .NET 8.0 (for running the WebApp)
- The application must be running on `https://localhost:5179`

## Installation

Cypress is already installed. If you need to reinstall or update:

```bash
npm install
```

## Running Tests

### Open Cypress Test Runner (Interactive)
```bash
npm run cypress:open
```
This opens the Cypress UI where you can select and run individual tests.

### Run All Tests Headless
```bash
npm run cypress:run
```
This runs all tests in headless mode (no browser window).

### Run Tests with Browser Visible
```bash
npm run cypress:run:headed
```

### Run Specific Test File
```bash
npm run cypress:run:spec "cypress/e2e/homepage.cy.ts"
```

## Project Structure

```
cypress/
├── e2e/                     # End-to-end test files
│   ├── homepage.cy.ts      # Homepage tests
│   ├── navigation.cy.ts    # Navigation tests
│   └── api.cy.ts           # API interaction tests
├── fixtures/               # Test data files
├── support/
│   ├── e2e.ts             # E2E support file (runs before each test)
│   ├── commands.ts        # Custom Cypress commands
│   └── component.ts       # Component testing support
└── cypress.config.ts       # Cypress configuration
```

## Writing Tests

### Basic Test Example
```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    cy.visit('/'); // Navigate to base URL
  });

  it('should perform action', () => {
    cy.contains('button', 'Click Me').click();
    cy.url().should('include', '/new-page');
  });
});
```

### Using Custom Commands
```typescript
describe('Authentication', () => {
  it('should login successfully', () => {
    cy.login('user@example.com', 'password');
    cy.contains('Dashboard').should('be.visible');
  });

  it('should logout', () => {
    cy.login('user@example.com', 'password');
    cy.logout();
  });
});
```

## Configuration

The `cypress.config.ts` file contains the main configuration:
- **baseUrl**: `https://localhost:5179` (WebApp URL)
- **viewportWidth/Height**: `1280x720`
- **defaultCommandTimeout**: `10000ms`

## CI/CD Integration

A GitHub Actions workflow is configured in `.github/workflows/cypress.yml`. It will:
1. Run on push to `main` or `develop` branches
2. Run on all pull requests to these branches
3. Build and start the WebApp
4. Execute all Cypress tests
5. Upload videos and screenshots on failure

## Debugging

### Debug Single Test
1. Run `npm run cypress:open`
2. Select the test file
3. Use browser DevTools (F12)
4. Use `cy.debug()` or `cy.pause()` in your test code

### View Test Reports
After running tests, check:
- Videos: `cypress/videos/`
- Screenshots: `cypress/screenshots/`

## Useful Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress API Reference](https://docs.cypress.io/api/table-of-contents)

## Troubleshooting

**Tests fail with "Cannot find element"**
- Ensure the application is running on `https://localhost:5179`
- Check selectors using Cypress Inspector

**SSL Certificate errors**
- The config accepts self-signed certificates for localhost

**Tests timeout**
- Increase `defaultCommandTimeout` in `cypress.config.ts`
- Ensure database and API are responding
