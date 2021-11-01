var express = require('express');
var router = express.Router();

const TransactionsService = require('../services/transactions.service')
const AccountService = require('../services/account.service');
const errorHandler = require('../utility/error.handler');

const service = new TransactionsService();
const accountService = new AccountService();
const checkAccounts = (originAccount, toAccount) => {
    return Promise.all([accountService.find(originAccount), accountService.find(toAccount)]);
};

const getBalances  = (originAccount, toAccount) => {
    return Promise.all([service.findBalanceByAccount(originAccount), service.findBalanceByAccount(toAccount)]);
}

const rollbackTransfer = async (prevBalances, statusAccount, amount) =>{
    let currentBalances = await getBalances(statusAccount[0]._id.toString(), statusAccount[1]._id.toString());
    if (currentBalances[0].balance < prevBalances[0].balance) {
        let txn = {};

        txn.accountId = statusAccount[0]._id.toString();
        txn.createAt = new Date();
        txn.type = "receive";
        txn.amount = Number(amount);

        await service.save(txn);
    }

    if (currentBalances[1].balance > prevBalances[1].balance) {

        let txnSend = {};

        txnSend.accountId = statusAccount[1]._id.toString();
        txnSend.createAt = new Date();
        txnSend.type = "send";
        txnSend.amount = Number(amount);

        await service.save(txnSend);
    }
    
    
};

router.post("/:type/:accountId", async (req,res, next) => {
    let txn = req.body;

    txn.accountId = req.params.accountId;
    txn.createAt = new Date();
    txn.type = req.params.type =="credit"? "receive": "send";
    txn.amount = Number(txn.amount);
    await service.connect();
    service.save(txn).then((result) => {
        res.send(result);
    }).catch( err => {
        res.status = 500;
        res.send(err.message);
    });
});


router.post("/:from/transfer/:to", async (req,res, next) => {
    let originAccount = req.params.from;
    let toAccount = req.params.to;
    if (originAccount ===toAccount) {
        errorHandler(res, {status: 503, message: "The accounts should be differents"});
        return;
    }
    let creditTxn = { accountId: toAccount, amount: Number(req.body.amount), type: "receive", createAt : new Date() };
    let debitTxn = { accountId: originAccount,amount: Number(req.body.amount), type: "send" , createAt : new Date()};

    await service.connect();
    await accountService.connect();
    try{
        let statusAccount = await checkAccounts(originAccount, toAccount);
        let balances = await getBalances(originAccount, toAccount);
        Promise.all([service.save(creditTxn), service.save(debitTxn)])
            .then(async (results) => {
                res.send("Amount ("+req.body.amount+") transfered from `"+originAccount+"` to `"+toAccount+ "` account.")
            }).catch((err) =>{
                rollbackTransfer(balances, statusAccount, Number(req.body.amount));
                errorHandler(res, err);
            });
    }catch(e) {
        errorHandler(res, e);
        return;
    }
});



module.exports = require('./generic.router')(router, service);