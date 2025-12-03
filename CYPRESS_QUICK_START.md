# Quick Cypress E2E Testing Reference + Entra ID Guide

## ⚡ Quick Start (30 seconds)

1. **Start the WebApp** (in another terminal):
   ```bash
   cd src/WebApp
   dotnet run
   ```

2. **Open Cypress Test Runner**:
   ```bash
   npm run cypress:open
   ```

3. **Select a test and run it**

## 📋 Common Commands

| Command | Purpose |
|---------|---------|
| `npm run cypress:open` | Open interactive test runner |
| `npm run cypress:run` | Run all tests headless (CI mode) |
| `npm run cypress:run:headed` | Run tests with visible browser |
| `npm run cypress:run:spec "path/to/test.cy.ts"` | Run specific test file |

## 🧪 Available Tests

- **auth.cy.ts** - Authentication redirect and error handling
- **api-integration.cy.ts** - API endpoint health checks
- **homepage.cy.ts** - Page load without authentication
- **navigation.cy.ts** - Page structure validation
- **forms.cy.ts** - Form handling (if present)
- **dashboard.cy.ts** - (Add this with real auth)

## 🔐 Adding Real Entra ID Authentication

### Quick Setup (10 minutes)

**1. Create Test User in Azure Portal:**
```
Entra ID → Users → New user
Username: cypresstest@yourcompany.onmicrosoft.com
Set temporary password
```

**2. Create `cypress.env.json`:**
```json
{
  "TEST_EMAIL": "cypresstest@yourcompany.onmicrosoft.com",
  "TEST_PASSWORD": "YourSecurePassword123!"
}
```

**3. Add to `.gitignore`:**
```
cypress.env.json
```

**4. Use in Tests:**
```typescript
describe('Dashboard Tests', () => {
  beforeEach(() => {
    cy.entraIdLogin(); // From mock-auth.example.ts
  });

  it('should show dashboard', () => {
    cy.contains('Dashboard').should('be.visible');
  });
});
```

### Or Use Service Principal for API (No UI needed)

See `CYPRESS_ENTRA_ID_GUIDE.md` for full implementation.

## 📚 Useful Cypress Commands

```typescript
// Navigation
cy.visit('/');
cy.url().should('include', '/dashboard');

// Finding elements
cy.get('button').click();
cy.contains('Login').click();
cy.get('[data-testid="submit"]').should('be.visible');

// Form interactions
cy.get('input[type="email"]').type('test@example.com');
cy.get('textarea').clear().type('New text');
cy.get('select').select('Option 1');

// Assertions
cy.contains('Success').should('exist');
cy.get('.error').should('not.be.visible');
cy.url().should('include', '/confirmation');

// Wait & Debug
cy.wait(1000);
cy.debug();
cy.pause();
```

## 🐛 Debugging

1. Click pause (⏸) button in test runner
2. Use browser DevTools (F12)
3. Add `cy.debug()` in test code
4. Check `cypress/videos/` and `cypress/screenshots/` for artifacts

## 🔄 CI/CD

Tests run automatically on:
- Push to `main` or `develop`
- Pull requests to these branches

View workflow: `.github/workflows/cypress.yml`

## 📖 Full Documentation

See guides:
- `CYPRESS_SETUP.md` - Complete setup guide
- `CYPRESS_AUTH_STRATEGY.md` - Different auth approaches
- `CYPRESS_ENTRA_ID_GUIDE.md` - Entra ID authentication details
- `CYPRESS_DEMO_GUIDE.md` - Demo commands for presentations
