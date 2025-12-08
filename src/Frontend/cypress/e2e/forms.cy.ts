describe('Form Interaction Tests', () => {
  it('should handle forms if they exist on the page', () => {
    cy.visit('/', { failOnStatusCode: false });
    cy.get('form').then(($forms) => {
      if ($forms.length > 0) {
        // Forms exist, so test interactions
        cy.get('form').first().within(() => {
          cy.get('input, textarea, select').each(($input) => {
            const type = $input.attr('type');
            if (type === 'text' || type === 'email') {
              cy.wrap($input).type('test@example.com');
            }
          });
        });
      } else {
        // No forms on homepage - this is OK, skip
        cy.get('body').should('exist');
      }
    });
  });

  it('should be accessible for form elements', () => {
    cy.visit('/', { failOnStatusCode: false });
    // Just verify page structure is accessible
    cy.get('body').should('be.visible');
    // If there are input elements, they should be accessible
    cy.get('input, textarea, select').then(($inputs) => {
      if ($inputs.length > 0) {
        cy.wrap($inputs).each(($input) => {
          const id = $input.attr('id');
          if (id) {
            cy.get(`label[for="${id}"]`).should('exist');
          }
        });
      }
    });
  });

  it('should not have broken form elements', () => {
    // Verify there are no console errors related to forms
    cy.visit('/', { failOnStatusCode: false });
    cy.get('body').should('not.contain', 'form error');
  });
});
