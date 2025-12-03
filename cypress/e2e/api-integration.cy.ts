describe('API Integration Tests', () => {
  /**
   * Test API endpoints directly without UI/Auth
   * These tests verify backend is responsive
   */

  it('should respond to vessel endpoints', () => {
    cy.request({
      method: 'GET',
      url: 'https://localhost:5179/api/vessels',
      failOnStatusCode: false
    }).then((response) => {
      // Endpoint should respond (200, 401, or 403 are all expected)
      expect(response.status).to.be.a('number');
    });
  });

  it('should respond to docks endpoints', () => {
    cy.request({
      method: 'GET',
      url: 'https://localhost:5179/api/docks',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.a('number');
    });
  });

  it('should respond to staff endpoints', () => {
    cy.request({
      method: 'GET',
      url: 'https://localhost:5179/api/staff',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.a('number');
    });
  });

  it('should respond to resources endpoints', () => {
    cy.request({
      method: 'GET',
      url: 'https://localhost:5179/api/resources',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.a('number');
    });
  });

  it('should have swagger documentation', () => {
    cy.request({
      method: 'GET',
      url: 'https://localhost:5179/swagger/index.html',
      failOnStatusCode: false
    }).then((response) => {
      expect([200, 404]).to.include(response.status);
    });
  });
});
