
const args = process.argv.slice(2);
let dataType = "";
if (args.length > 0) {
    if (args[0].indexOf("large") > -1) {
        dataType = "-large";
    }
}
console.log(`accounts-api${dataType}.json`);
console.log(`transactions-api${dataType}.json`);

const accounts = require(`./accounts-api${dataType}.json`);
const transactions = require(`./transactions-api${dataType}.json`);

const client = require('./libraries/data-provider.mongodb');
const mapId = {};

async function load () {
    await client.connect();
    const db = client.db("account-transactions");
    const accountCollection = db.collection("accounts");
    const transactionCollection = db.collection("transactions");
    let elementsAcc = accounts.map( acc => {
        return {firstName: acc.firstName,
            lastName: acc.lastName, 
            country: acc.country, email: acc.email, dob: new Date(acc.dob), 
            mfa: acc.mfa, createdAt: new Date(acc.createdAt), updatedAt: new Date(acc.updatedAt),
            referredBy: acc.referredBy};
    })
    let insertedElements = await accountCollection.insertMany(elementsAcc);
    console.log(`Inserted ${insertedElements.insertedCount} accounts`);

    const ids = Object.values(insertedElements.insertedIds);
    ids.forEach( (objectId,index) => {
        mapId[accounts[index].email] = objectId.toString();
    });


    let elementsTxn = transactions.map(txn => {
        return {
            accountId: mapId[txn.userEmail], 
            amount: txn.amount, 
            type: txn.type, createdAt: new Date(txn.createdAt)
        }
    });

    insertedElements = await transactionCollection.insertMany(elementsTxn);

    console.log(`Inserted ${insertedElements.insertedCount} transactions`);

    client.close();
}

load()
.then(() => {
    console.log("Done.")
})
.catch(console.error);


