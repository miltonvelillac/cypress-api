/// <reference types="cypress" />

describe('Test with backend', () => {
    beforeEach(() => {
        cy.intercept('GET', '**/tags', {fixture: 'tags.json'});        
        (cy as any).loginToApplication();
    });

    it(`should log in`, () => {

        cy.intercept('POST', '**/articles').as('postArticles');

        cy.intercept({
            method: 'POST',
            url: '/articles',
            hostname: 'localhost:4200'
        }).as('postArticles');

        cy.log('we logged in!!');
        cy.contains('New Article').click();
        cy.get('[formcontrolname="title"]').type('This is a title 97');
        cy.get('[formcontrolname="description"]').type('This is a description');
        cy.get('[formcontrolname="body"]').type('This is a body of the article');
        cy.contains('Publish Article').click();

        cy.wait('@postArticles');
        cy.get('@postArticles').then(xhr => console.log(xhr))
    });

    it(`verify correct request and response`, () => {
        cy.get('.tag-list')
            .should('contain', 'cypress')
            .and('contain', 'automation')
            .and('contain', 'testing');
    });

    it.only(`verify global articles`, () => {
        cy.intercept('GET', '**/articles/feed*', '{"articles":[],"articlesCount":0}');
        cy.intercept('GET', '**/articles*', { fixture: 'articles.json' });

        cy.contains('Global Feed').click();
        cy.get('app-article-list button').then(listOfButtons => {
            expect(listOfButtons[0]).to.contain('0');
            expect(listOfButtons[1]).to.contain('21');
        });

        cy.fixture('articles').then(file => {
            const articleLink = file.articles[1].slug;
            cy.intercept('POST', `**/articles/${articleLink}/favorite`, file);
        });

        cy.get('app-article-list button').eq(1).click();
    });
});