/**
 * Microsoft Entra ID Authentication for Cypress Tests
 * 
 * Three approaches for testing with real Azure AD authentication
 */

// ============================================
// APPROACH 1: Test User Login (UI Testing)
// Real authentication through Entra ID login page
// ============================================

Cypress.Commands.add('entraIdLogin', (email?: string, password?: string) => {
  const testEmail = email || Cypress.env('TEST_EMAIL');
  const testPassword = password || Cypress.env('TEST_PASSWORD');

  cy.visit('/');
  
  // Entra ID redirects to login page
  cy.get('input[type="email"]', { timeout: 10000 })
    .type(testEmail, { log: false });
  
  cy.get('input[type="password"]')
    .type(testPassword, { log: false });
  
  // Click sign in button (selector may vary)
  cy.get('button')
    .contains(/sign in|login|submit/i)
    .click();
  
  // Handle MFA if present
  cy.get('body').then(($body) => {
    if ($body.text().includes('approve') || $body.text().includes('verify')) {
      // MFA screen - may need manual approval or TOTP
      cy.log('MFA required - may need manual approval');
    }
  });
  
  // Wait for redirect back to app (not on login page)
  cy.url({ timeout: 15000 })
    .should('not.include', 'login.microsoftonline.com');
  
  // Verify logged in
  cy.get('body').should('not.contain', 'sign in');
});

Cypress.Commands.add('entraIdLogout', () => {
  // Find logout button/link
  cy.get('[data-testid="user-menu"], button[aria-label*="account"]')
    .click();
  
  cy.get('button, a').contains(/logout|sign out/i)
    .click();
  
  // Should redirect to login
  cy.url().should('include', 'login.microsoftonline.com');
});

// ============================================
// APPROACH 2: Service Principal Token (API Testing)
// Get token for API calls without UI login
// ============================================

Cypress.Commands.add('getServicePrincipalToken', () => {
  return cy.request({
    method: 'POST',
    url: `https://login.microsoftonline.com/${Cypress.env('TENANT_ID')}/oauth2/v2.0/token`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: {
      client_id: Cypress.env('CLIENT_ID'),
      client_secret: Cypress.env('CLIENT_SECRET'),
      scope: `api://${Cypress.env('API_APP_ID')}/.default`,
      grant_type: 'client_credentials'
    },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200) {
      return response.body.access_token;
    } else {
      throw new Error('Failed to get service principal token');
    }
  });
});

// ============================================
// APPROACH 3: API Calls with Service Principal
// Makes authenticated API requests
// ============================================

Cypress.Commands.add('apiRequest', (
  method: string,
  url: string,
  body?: any
) => {
  cy.getServicePrincipalToken().then((token) => {
    cy.request({
      method: method as any,
      url: url,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: body,
      failOnStatusCode: false
    });
  });
});

// ============================================
// USAGE EXAMPLES
// ============================================

/*

// EXAMPLE 1: Test User - Full UI Testing
describe('Dashboard with Real Entra ID', () => {
  beforeEach(() => {
    cy.entraIdLogin();
  });

  afterEach(() => {
    cy.entraIdLogout();
  });

  it('should display dashboard after login', () => {
    cy.contains('Dashboard').should('be.visible');
  });

  it('should display user name', () => {
    cy.get('[data-testid="user-name"]').should('contain', Cypress.env('TEST_EMAIL'));
  });
});


// EXAMPLE 2: Service Principal - API Testing
describe('API with Service Principal', () => {
  it('should get vessels list', () => {
    cy.apiRequest('GET', 'https://localhost:5179/api/vessels')
      .then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
      });
  });

  it('should create vessel', () => {
    cy.apiRequest('POST', 'https://localhost:5179/api/vessels', {
      name: 'Test Vessel',
      imo: '1234567',
      type: 'Container Ship'
    }).then((response) => {
      expect([200, 201]).to.include(response.status);
    });
  });
});


// EXAMPLE 3: Mix Both Approaches
describe('End-to-End with API Verification', () => {
  beforeEach(() => {
    cy.entraIdLogin();
  });

  it('should create vessel through UI and verify with API', () => {
    // Create through UI
    cy.visit('/vessels/new');
    cy.get('input[name="name"]').type('Test Vessel');
    cy.get('input[name="imo"]').type('1234567');
    cy.get('button').contains('Create').click();

    // Verify with API
    cy.getServicePrincipalToken().then((token) => {
      cy.request({
        method: 'GET',
        url: 'https://localhost:5179/api/vessels',
        headers: { 'Authorization': `Bearer ${token}` }
      }).then((response) => {
        const vessel = response.body.find((v: any) => v.name === 'Test Vessel');
        expect(vessel).to.exist;
      });
    });
  });
});

*/

// ============================================
// SETUP INSTRUCTIONS
// ============================================

/*

STEP 1: Create Test User in Entra ID
  1. Go to Azure Portal
  2. Navigate to: Entra ID → Users → New user
  3. Create: cypresstest@yourcompany.onmicrosoft.com
  4. Set password (temporary or permanent)
  5. User may need to change password on first login

STEP 2: Create cypress.env.json (add to .gitignore)

  For Test User:
  {
    "TEST_EMAIL": "cypresstest@yourcompany.onmicrosoft.com",
    "TEST_PASSWORD": "SecurePassword123!"
  }

  For Service Principal (API testing):
  {
    "TENANT_ID": "a8192c11-2c11-4411-a807-8b0659f4c9a9",
    "CLIENT_ID": "6bff1175-b880-4a1d-b320-ff8fcbbd1b99",
    "CLIENT_SECRET": "your-secret-here",
    "API_APP_ID": "your-api-app-id"
  }

  For Both:
  {
    "TEST_EMAIL": "cypresstest@yourcompany.onmicrosoft.com",
    "TEST_PASSWORD": "SecurePassword123!",
    "TENANT_ID": "a8192c11-2c11-4411-a807-8b0659f4c9a9",
    "CLIENT_ID": "6bff1175-b880-4a1d-b320-ff8fcbbd1b99",
    "CLIENT_SECRET": "your-secret-here",
    "API_APP_ID": "your-api-app-id"
  }

STEP 3: Update .gitignore
  Add this line (if not already there):
  cypress.env.json

STEP 4: Add Type Definitions to tsconfig.json
  
  Already done! Check tsconfig.json

STEP 5: Use Commands in Tests

  Test User:
  beforeEach(() => {
    cy.entraIdLogin();
  });

  Service Principal:
  cy.getServicePrincipalToken().then((token) => {
    // Use token in cy.request()
  });

  Or use helper:
  cy.apiRequest('GET', '/api/vessels');

*/

declare global {
  namespace Cypress {
    interface Chainable {
      entraIdLogin(email?: string, password?: string): Chainable<void>;
      entraIdLogout(): Chainable<void>;
      getServicePrincipalToken(): Chainable<string>;
      apiRequest(method: string, url: string, body?: any): Chainable<any>;
    }
  }
}

export {};
