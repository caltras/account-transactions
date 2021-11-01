var express = require('express');
var router = express.Router();

const AccountService = require('../services/account.service');
const TransactionsService = require('../services/transactions.service')
const errorHandler = require('../utility/error.handler');


const accountService = new AccountService();
const transactionService = new TransactionsService();

router.get("/:id/balance/", (req, res, next) => {
  if (req.query["full"]  && req.query["full"]=="1") {
    Promise.all([transactionService.connect(), accountService.connect()]).then(() => {
      Promise.all([accountService.find(req.params.id),transactionService.findBalanceByAccount(req.params.id)])
        .then(results => {
          let account = results[0];
          let balanceTransactions = results[1];

          res.json({
            ...account,
            balance: balanceTransactions.balance
          });
        }).catch(err => {
          errorHandler(res, err);
        });
    })
  }else {
    transactionService.connect()
    .then(() =>{
      transactionService.findBalanceByAccount(req.params.id)
        .then((result) => {
          res.json(result);
        }).catch(err => {
          errorHandler(res, err);
        });
      });
  }
});

module.exports = require('./generic.router')(router, accountService);
