const GenericService = require('./generic.service');

module.exports = class TransactionsService extends GenericService{
    constructor() {
        super("transactions");
    }

    findBalanceByAccount(id) {

        return new Promise((resolve, reject) => {
            this.collection.find({accountId: id})
            .toArray((err, results) => {
                let balance = 0;
                if (err ) {
                    reject(err);
                } else {
                    results.forEach( (txn) => {
                        if (txn.type === "receive") { 
                            balance+=txn.amount;
                        } else {
                            balance-=txn.amount;
                        }
                    });
                }
                resolve({
                    _id: id,
                    balance,
                });
            });
        });

    }
}