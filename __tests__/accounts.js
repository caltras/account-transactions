const server = require('../api/app');
const supertest = require('supertest');
const requestWithSupertest = supertest(server);

describe("Test accounts endpoint", () =>{
    let objectIdSaved = null;

    test('GET /accounts should return the accounts', async () => {
        const resp = await requestWithSupertest.get("/accounts");
        expect(resp.status).toEqual(200);
        expect(resp.type).toEqual(expect.stringContaining('json'));
        expect(resp.body.length).toEqual(10);
    });

    test('GET /accounts should return 5 accounts', async () => {
        const resp = await requestWithSupertest.get("/accounts?limit=5");
        expect(resp.status).toEqual(200);
        expect(resp.type).toEqual(expect.stringContaining('json'));
        expect(resp.body.length).toEqual(5);
    });

    test('POST /accounts save a new object', async () => {
        let newAccount = {
            "firstName": "Claudio",
            "lastName": "Traspadini Oliveira",
            "country": "CA",
            "email": "caltras@gmail.com",
            "dob": "1985-08-27T08:00:00.0Z",
            "mfa": "TOTP",
            "createdAt": "2018-08-17T09:56:22.804Z",
            "updatedAt": "2018-08-17T09:56:22.804Z",
            "referredBy": null
        };
        const resp = await requestWithSupertest.post("/accounts").send(newAccount);
        expect(resp.status).toEqual(200);
        expect(resp.type).toEqual(expect.stringContaining('text'));
        expect(resp.text).toEqual(expect.stringContaining('Element'));
        expect(resp.text).toEqual(expect.stringContaining('inserted.'));

        objectIdSaved = resp.text.replace("Element","").replace("inserted.","").trim();
    });

    test('PUT /accounts update an object', async () => {
        let newAccount = {
            "firstName": "Claudio",
            "lastName": "Traspadini Oliveira",
            "country": "CA",
            "email": "caltras@gmail.com",
            "dob": "1985-08-27T08:00:00.0Z",
            "mfa": "TOTP",
            "createdAt": "2018-08-17T09:56:22.804Z",
            "updatedAt": "2018-08-17T09:56:22.804Z",
            "referredBy": null
        };
        const resp = await requestWithSupertest.put("/accounts/"+objectIdSaved).send(newAccount);
        expect(resp.status).toEqual(200);
        expect(resp.type).toEqual(expect.stringContaining('text'));
        expect(resp.text).toEqual(expect.stringContaining('Element '+objectIdSaved+' updated.'));
    });

    test('GET /accounts/:id should return an account', async () => {
        const resp = await requestWithSupertest.get("/accounts/"+objectIdSaved);
        expect(resp.status).toEqual(200);
        expect(resp.type).toEqual(expect.stringContaining('json'));
        expect(resp.body._id).toEqual(objectIdSaved);
        expect(resp.body.firstName).toEqual("Claudio");
        expect(resp.body.lastName).toEqual("Traspadini Oliveira");
        expect(resp.body.country).toEqual("CA");
        expect(resp.body.email).toEqual("caltras@gmail.com");
        expect(resp.body.mfa).toEqual("TOTP");
    });


    test('GET /accounts/:id/balance should return the account\'s balance', async () => {
        const resp = await requestWithSupertest.get("/accounts/"+objectIdSaved+"/balance");
        expect(resp.status).toEqual(200);
        expect(resp.type).toEqual(expect.stringContaining('json'));
        expect(resp.body._id).toEqual(objectIdSaved);
        expect(resp.body.balance).toEqual(0);
    });

    test('GET /accounts/:id/balance should return the account\'s balance and account information', async () => {
        const resp = await requestWithSupertest.get("/accounts/"+objectIdSaved+"/balance?full=1");
        expect(resp.status).toEqual(200);
        expect(resp.type).toEqual(expect.stringContaining('json'));
        expect(resp.body._id).toEqual(objectIdSaved);
        expect(resp.body.balance).toEqual(0);
        expect(resp.body.firstName).toEqual("Claudio");
        expect(resp.body.lastName).toEqual("Traspadini Oliveira");
        expect(resp.body.country).toEqual("CA");
        expect(resp.body.email).toEqual("caltras@gmail.com");
        expect(resp.body.mfa).toEqual("TOTP");
    });


    afterAll((done) => {
        done();
    })

    
});