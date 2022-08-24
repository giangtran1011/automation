// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add('login', (username, password) => {
    let access_token = "";
    cy.visit('https://sandbox-app.creativeforce.io/logged-out');
    cy.contains('Login').click();
    cy.get("#Username").type(username);
    cy.get("#Password").type(password);
    cy.get("#btnSubmit").click()
    .should(() => {
      access_token = JSON.parse(localStorage.getItem('user')).token.access_token;
      return access_token;
    });
});