# Cypress Testing with Microsoft Entra ID Authentication

## The Reality
You cannot easily bypass Microsoft Entra ID - it's designed to be secure. But you have real solutions.

## Best Approaches for Your Situation

### ✅ APPROACH 1: Test Unauthenticated Endpoints (What We Have Now)

**Advantages:**
- No credentials needed
- Works immediately
- Tests API responsiveness
- Monitors backend health
- Tests error handling

**Current Implementation:**
- `auth.cy.ts` - Auth redirect handling
- `api-integration.cy.ts` - API endpoint verification
- `homepage.cy.ts` - Page load without auth
- No credentials needed!

**Run tests:**
```bash
npm run cypress:run
```

---

### ✅ APPROACH 2: Create a Test User in Entra ID (Recommended)

**Setup (One-time):**
1. Go to Azure Portal → Entra ID → Users
2. Create test user: `cypresstest@yourcompany.onmicrosoft.com`
3. Set password: Temporary strong password
4. User must reset on first login (or set permanent)

**Implementation:**
```bash
# Create cypress.env.json (add to .gitignore)
{
  "TEST_EMAIL": "cypresstest@yourcompany.onmicrosoft.com",
  "TEST_PASSWORD": "YourSecurePassword123!"
}
```

**Usage in tests:**
```typescript
describe('Dashboard Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    // Entra ID redirects to login
    cy.get('input[type="email"]').type(Cypress.env('TEST_EMAIL'));
    cy.get('input[type="password"]').type(Cypress.env('TEST_PASSWORD'));
    cy.get('button').contains(/sign in|login/i).click();
    
    // Wait for redirect back to app
    cy.url().should('not.include', 'login');
  });

  it('should show dashboard', () => {
    cy.contains('Dashboard').should('be.visible');
  });
});
```

**Advantages:**
- Real authentication flow testing
- Tests actual user experience
- No mocking needed
- Works with all features

**Disadvantages:**
- Requires test account setup
- Slower (real auth flow)
- Password management needed

---

### ✅ APPROACH 3: Use Service Principal / App Registration Token

**For API-only testing (no UI):**

```typescript
describe('API Tests with Service Principal', () => {
  let accessToken: string;

  before(() => {
    // Get token from Entra ID
    cy.request({
      method: 'POST',
      url: 'https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: {
        client_id: Cypress.env('CLIENT_ID'),
        client_secret: Cypress.env('CLIENT_SECRET'),
        scope: 'api://port-management/.default',
        grant_type: 'client_credentials'
      }
    }).then((response) => {
      accessToken = response.body.access_token;
    });
  });

  it('should get vessels with auth', () => {
    cy.request({
      method: 'GET',
      url: 'https://localhost:5179/api/vessels',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }).then((response) => {
      expect(response.status).to.equal(200);
    });
  });
});
```

**Advantages:**
- Perfect for API testing
- No user account needed
- Fast, automated
- Works in CI/CD
- No password management

**Disadvantages:**
- Requires app registration setup
- Doesn't test UI login flow
- Only for API endpoints

**Setup:**
1. Azure Portal → App registrations → New registration
2. Create app: "Cypress Tests"
3. Add API permission to your backend API
4. Create client secret
5. Add to `cypress.env.json`:
```json
{
  "CLIENT_ID": "your-app-id",
  "CLIENT_SECRET": "your-secret",
  "TENANT_ID": "your-tenant-id"
}
```

---

### ✅ APPROACH 4: Hybrid Approach (Recommended)

**Use both:**

1. **Unauthenticated tests** (current)
   - Health checks
   - Error handling
   - No credentials needed

2. **Service Principal for API** 
   - Full API testing
   - Automated, fast
   - No UI needed

3. **Test User for E2E** (optional)
   - Real user flows
   - UI interaction
   - Full integration

**Example structure:**
```
cypress/e2e/
├── health/
│   ├── auth.cy.ts              # No auth needed
│   ├── api-integration.cy.ts   # No auth needed
│   └── homepage.cy.ts          # No auth needed
├── api/
│   └── api-authenticated.cy.ts # Service Principal
└── e2e/
    ├── dashboard.cy.ts          # Test user
    ├── vessel-management.cy.ts  # Test user
    └── user-workflows.cy.ts     # Test user
```

---

## Recommendation for Your Project

### Phase 1: Now (What we have)
✅ Unauthenticated tests working  
✅ API endpoints monitored  
✅ CI/CD ready  

### Phase 2: Next Sprint
1. Choose: Service Principal OR Test User
2. Implement one approach
3. Add 10-15 authenticated tests
4. Monitor in CI/CD

### Phase 3: Long-term
Combination of all three:
- Health/monitoring tests (no auth)
- API integration tests (service principal)
- E2E user workflows (test user)

---

## My Recommendation

**Do this TODAY (takes 10 minutes):**
1. Create test user in Entra ID
2. Add credentials to `cypress.env.json`
3. Create 1-2 dashboard tests
4. See it work live

**Benefits:**
- Tests your ACTUAL flow
- No mocking needed
- Real user experience
- Shows working tests tomorrow

**Then LATER:**
- Add service principal for API
- Scale to more tests
- Integrate with CI/CD

---

## Code Example: Test User Login

```typescript
// cypress/support/commands.ts

Cypress.Commands.add('entraIdLogin', () => {
  cy.visit('/');
  
  // Entra ID login page
  cy.get('input[type="email"]')
    .type(Cypress.env('TEST_EMAIL'), { log: false });
  
  cy.get('input[type="password"]')
    .type(Cypress.env('TEST_PASSWORD'), { log: false });
  
  cy.get('button').contains(/sign in|login/i).click();
  
  // Wait for redirect back to app
  cy.url().should('not.include', 'login.microsoftonline.com');
  
  // Wait for dashboard to load
  cy.get('[data-testid="dashboard"]', { timeout: 10000 })
    .should('be.visible');
});

// Usage:
describe('Dashboard Tests', () => {
  beforeEach(() => {
    cy.entraIdLogin();
  });

  it('should display user info', () => {
    cy.contains('Welcome').should('be.visible');
  });
});
```

---

## Summary

| Approach | Setup Time | Credentials | Speed | Coverage |
|----------|-----------|-------------|-------|----------|
| Unauthenticated (Current) | ✅ Done | None | Fast | Limited |
| Test User | 5 min | Email/Password | Slow | Full UI |
| Service Principal | 15 min | ClientID/Secret | Fast | API Only |
| Hybrid (All three) | 20 min | Multiple | Mixed | Complete |

**Next action: Pick one approach and implement it!**
