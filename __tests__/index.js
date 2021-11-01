const server = require('../api/app');
const supertest = require('supertest');
const requestWithSupertest = supertest(server);

describe("Test Welcome page", () =>{

    test('GET / should return the welcome page', async () => {
        const resp = await requestWithSupertest.get("/");
        expect(resp.status).toEqual(200);
        expect(resp.type).toEqual(expect.stringContaining('html'));
        expect(resp.text).toEqual(expect.stringContaining('Account Transactions'));
    });

    afterAll((done) => {
        done();
    })

    
});