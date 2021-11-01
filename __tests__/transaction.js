const server = require('../api/app');
const supertest = require('supertest');
const requestWithSupertest = supertest(server);

describe("Test transactions endpoint", () =>{
    let objectIdSaved = null;

    test('GET /transaction should return the accounts', async () => {
        const resp = await requestWithSupertest.get("/transactions");
        expect(resp.status).toEqual(200);
        expect(resp.type).toEqual(expect.stringContaining('json'));
        expect(resp.body.length).toEqual(10);
    });

    test('GET /transactions should return 5 accounts', async () => {
        const resp = await requestWithSupertest.get("/transactions?limit=5");
        expect(resp.status).toEqual(200);
        expect(resp.type).toEqual(expect.stringContaining('json'));
        expect(resp.body.length).toEqual(5);
    });

    test('POST /transactions save a new object', async () => {

        const respAccount = await requestWithSupertest.get("/accounts");
        let account = respAccount.body[0];

        let newTxn = {
            "accountId": account._id.toString(),
            "amount": 1,
            "type": "receive",
            "createdAt": new Date().toString()
        };
        const resp = await requestWithSupertest.post("/transactions").send(newTxn);
        expect(resp.status).toEqual(200);
        expect(resp.type).toEqual(expect.stringContaining('text'));
        expect(resp.text).toEqual(expect.stringContaining('Element'));
        expect(resp.text).toEqual(expect.stringContaining('inserted.'));

        objectIdSaved = resp.text.replace("Element","").replace("inserted.","").trim();
    });

    test('GET /transactions/:id should return an transaction', async () => {
        const resp = await requestWithSupertest.get("/transactions/"+objectIdSaved);
        expect(resp.status).toEqual(200);
        expect(resp.type).toEqual(expect.stringContaining('json'));
        expect(resp.body._id).toEqual(objectIdSaved);
        expect(resp.body.amount).toEqual(1);
        expect(resp.body.type).toEqual("receive");
    });

    test('GET /transactions/debit/:id should do a debit', async () => {
        const obj = {amount: 1};
        const resp = await requestWithSupertest.post("/transactions/debit/"+objectIdSaved).send(obj);
        expect(resp.status).toEqual(200);
        expect(resp.type).toEqual(expect.stringContaining('json'));
        expect(resp.body.acknowledged).toEqual(true);
    });

    test('GET /transactions/credit/:id should do a credit', async () => {
        const obj = {amount: 20};
        const resp = await requestWithSupertest.post("/transactions/credit/"+objectIdSaved).send(obj);
        expect(resp.status).toEqual(200);
        expect(resp.type).toEqual(expect.stringContaining('json'));
        expect(resp.body.acknowledged).toEqual(true);
    });

    test('POST /transactions/:from/transfer/:to transfer a value to another account', async () => {
        const respAccount = await requestWithSupertest.get("/accounts");
        let account = respAccount.body[0];
        let account2 = respAccount.body[1];

        const obj = {amount: 10};

        const balance = await requestWithSupertest.get(`/accounts/${account._id.toString()}/balance`);
        const balance2 = await requestWithSupertest.get(`/accounts/${account2._id.toString()}/balance`);

        const resp = await requestWithSupertest
            .post(`/transactions/${account._id.toString()}/transfer/${account2._id.toString()}`)
            .send(obj);
            
        expect(resp.status).toEqual(200);
        expect(resp.type).toEqual(expect.stringContaining('text'));
        expect(resp.text).toEqual(`Amount (${obj.amount}) transfered from \`${account._id.toString()}\` to \`${account2._id.toString()}\` account.`);

        const balanceAfter = await requestWithSupertest.get(`/accounts/${account._id.toString()}/balance`);
        const balance2After = await requestWithSupertest.get(`/accounts/${account2._id.toString()}/balance`);

        expect(balanceAfter.body.balance).toEqual(balance.body.balance - obj.amount);
        expect(balance2After.body.balance).toEqual(balance2.body.balance + obj.amount);
    });

    test('POST /transactions/:from/transfer/:to transfer a value to another account, an account doesn\'t exist', 
    async () => {
        const respAccount = await requestWithSupertest.get("/accounts");
        let account = respAccount.body[0];
        let account2 = "617f20968ff6f7facb64ab50";

        const obj = {amount: 10};

        const resp = await requestWithSupertest
            .post(`/transactions/${account._id.toString()}/transfer/${account2}`)
            .send(obj);
            
        expect(resp.status).toEqual(404);
        expect(resp.type).toEqual(expect.stringContaining('text'));
        expect(resp.text).toEqual(`Element \`${account2}\` not found on collection \`accounts\`.`);
    });

    afterAll((done) => {
        done();
    })

    
});