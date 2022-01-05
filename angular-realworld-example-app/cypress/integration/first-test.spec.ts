/// <reference types="cypress" />

describe('Test with backend', () => {
    beforeEach(() => {
        cy.intercept({ method: 'GET', path: 'tags' }, { fixture: 'tags.json' });
        (cy as any).loginToApplication();
    });

    it(`should log in`, () => {

        cy.intercept('POST', '**/articles').as('postArticles');

        cy.log('we logged in!!');
        cy.contains('New Article').click();
        cy.get('[formcontrolname="title"]').type('This is a title 94');
        cy.get('[formcontrolname="description"]').type('This is a description');
        cy.get('[formcontrolname="body"]').type('This is a body of the article');
        cy.contains('Publish Article').click();

        cy.wait('@postArticles');
        cy.get('@postArticles').then(xhr => console.log(xhr))
    });

    it(`modifying the request`, () => {

        const descTwo = 'Description two';

        cy.intercept('POST', '**/articles', req => {
            req.body.article.description = 'My description intercepted';
        }).as('postArticles');

        // cy.intercept('POST', '**/articles', req => {
        //     req.reply(res => {
        //         console.log('res...', res)
        //         expect(res.body.article.description).to.equal('This is a description');
        //         res.body.article.description = descTwo;
        //     });            
        // }).as('postArticles');

        cy.contains('New Article').click();
        cy.get('[formcontrolname="title"]').type('This is a title 91');
        cy.get('[formcontrolname="description"]').type('This is a description');
        cy.get('[formcontrolname="body"]').type('This is a body of the article');
        cy.contains('Publish Article').click();

        cy.wait('@postArticles');
        cy.get('@postArticles').then((xhr: any) => {
            console.log(xhr);
            // expect(xhr.response.body.article.description).to.equal(descTwo);
        });
    });

    it(`verify correct request and response`, () => {
        cy.get('.tag-list')
            .should('contain', 'cypress')
            .and('contain', 'automation')
            .and('contain', 'testing');
    });

    it(`verify global articles`, () => {
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

    it.only(`Delete a new article`, () => {
        const articleTitle = `Article ${new Date().getTime()}`;
        const bodyRequest = {
            "article": {
                "tagList": [
                    "angular",
                    "testing"
                ],
                "title": articleTitle,
                "description": "sub title",
                "body": "description"
            }
        };

        cy.get('@token').then(token => {
            cy.request({
                url: 'https://api.realworld.io/api/articles/',
                headers: {
                    'Authorization': `Token ${token}`
                },
                method: 'POST',
                body: bodyRequest
            }).then(response => {
                expect(response.status).to.equal(200);
            });

            cy.contains('Global Feed').click();
            cy.get('a h1').contains(articleTitle).click();
            cy.get('.article-actions').contains('Delete Article').click();

            cy.wait(500);

            cy.request({
                url: 'https://api.realworld.io/api/articles?limit=10&offset=0',
                headers: {
                    'Authorization': `Token ${token}`
                },
                method: 'GET',
            }).its('body').then(body => {
                const articles = body.articles;
                expect(articles.length).to.greaterThan(0);
                console.log(articles);
                for (const art of articles) {
                    console.log('article name', articleTitle);
                    expect(art.title).not.to.equal(articleTitle);
                }
            });
        });

    });
});