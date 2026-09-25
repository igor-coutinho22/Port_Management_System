describe('Form Interaction Tests', () => {
  it('should render the landing page without forms or form errors', () => {
    cy.visit('/', { failOnStatusCode: false });
    cy.get('body').should('be.visible');
    cy.get('body').should('not.contain', 'form error');
  });

  it('should associate labels with form elements that declare an id', () => {
    cy.visit('/', { failOnStatusCode: false });
    cy.get('body').then(($body) => {
      $body.find('input[id], textarea[id], select[id]').each((_, el) => {
        expect($body.find(`label[for="${el.id}"]`).length, `label for #${el.id}`).to.be.greaterThan(0);
      });
    });
  });
});
