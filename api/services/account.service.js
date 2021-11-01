const GenericService = require('./generic.service');


module.exports = class AccountService extends GenericService{
    constructor() {
        super("accounts");
    }
}