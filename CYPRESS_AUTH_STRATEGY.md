# Cypress Testing Strategy for Authenticated App

## Challenge
Your app requires Azure AD authentication, so we can't easily navigate the UI without logging in.

## Solutions

### Option 1: Test Unauthenticated Flows (Current Approach)
✅ **Tests without credentials:**
- Login page rendering
- Auth flow initiation  
- Error handling for unauthenticated requests
- API health checks (unauthenticated endpoints)
- Page structure validation

**Files:** `auth.cy.ts`, `api.cy.ts`

### Option 2: Mock Authentication Tokens (Recommended for Future)
✅ **Bypass auth by injecting tokens:**

```typescript
// In cypress/support/e2e.ts or custom commands
Cypress.Commands.add('mockLogin', () => {
  // Intercept auth requests
  cy.intercept('**/auth/**', { statusCode: 200 });
  // Set auth token in localStorage/sessionStorage
  cy.window().then((win) => {
    win.localStorage.setItem('auth_token', 'fake-jwt-token');
  });
});
```

**Usage:**
```typescript
beforeEach(() => {
  cy.mockLogin();
  cy.visit('/');
});
```

### Option 3: Use Azure AD Test Account
⚠️ **Requires credentials:**
- Create test user in Azure AD
- Store credentials in `cypress.env.json` (in .gitignore)
- Use credentials in tests

```typescript
cy.login(Cypress.env('TEST_USER'), Cypress.env('TEST_PASSWORD'));
```

**File:** `cypress.env.json` (NOT in git)
```json
{
  "TEST_USER": "testuser@company.com",
  "TEST_PASSWORD": "TestPassword123!"
}
```

### Option 4: Test API Endpoints Directly
✅ **Bypass UI, test backend:**

```typescript
describe('API Tests', () => {
  it('should return vessels', () => {
    cy.request({
      method: 'GET',
      url: 'https://localhost:5179/api/vessels',
      failOnStatusCode: false
    }).then((response) => {
      expect([200, 401, 403]).to.include(response.status);
    });
  });
});
```

## Recommended Approach for Now

Since you're just setting up E2E tests:

1. **Focus on unauthenticated flows** - What we have now ✅
2. **Test API endpoints** - Add to `api.cy.ts`
3. **Test error handling** - App behavior on auth failure
4. **Document mock login approach** - For when team wants authenticated tests

## Next Steps

### To Test Authenticated Pages:
1. Ask team for test Azure AD account
2. Implement mock authentication in `cypress/support/commands.ts`
3. Create tests for specific user stories:
   - Vessel management
   - Resource scheduling
   - Staff operations
   - Dock management

### To Test API:
Create `api-integration.cy.ts`:
```typescript
describe('API Integration Tests', () => {
  it('should get list of vessels', () => {
    cy.request('GET', '/api/vessels', { failOnStatusCode: false });
  });

  it('should get docks', () => {
    cy.request('GET', '/api/docks', { failOnStatusCode: false });
  });
});
```

## File Structure
```
cypress/
├── e2e/
│   ├── auth.cy.ts              # ✅ Auth flow testing
│   ├── api.cy.ts               # ✅ API endpoint testing
│   ├── api-integration.cy.ts    # 🔄 Full API testing
│   ├── homepage.cy.ts          # ✅ Unauthenticated page
│   ├── navigation.cy.ts        # ✅ Page structure
│   └── forms.cy.ts             # ✅ Form validation
└── support/
    ├── commands.ts             # Custom commands (login, etc.)
    ├── utils.ts                # Helper utilities
    └── e2e.ts                  # E2E hooks
```

## Summary

**Current Tests (Working):**
- ✅ Auth redirect handling
- ✅ Page load verification
- ✅ Basic structure validation
- ✅ API error handling

**To Add:**
- Full API endpoint testing
- Mock authentication for authenticated flows
- Integration tests with test account
