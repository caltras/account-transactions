# Account transactions app

This api provides service to Create, Update and Read an account and a transaction.

Moreover, It is possible to make transactions between accounts, as such as to debit and credit an account, transfer an amount of money to another account and check the account's balance.

## Installing
This project is using mongodb + expressjs. I am using node v16.5.0.

For tests, it is using jest and supertest.

After installing nodejs
on the root folder run the command `npm install` to install the general dependencies.

On folder api, run the same command in order to install the expressjs dependencies.


## Running

1. Run mongodb container. A script is available on folder `scripts`
    
    1.1  `sh run-mongodb.sh`

2. Load the mongo db with the data. For this project was used the large data, 10k accounts and 94k transactions.

    2.2 To use the large db, on `scripts` folder, run the command `node load-into-mongodb.js large`, it will take few seconds to load.

    2.3 If you want to use the small datasource, just remove the `large` parameter. `node load-into-mongodb.js`

3. On root folder, run the command `npm start` to run the API

4. For running the tests and check the coverage, run the command `npm test`
    4.1 The report are available on `coverage` folder

## Endpoints

The api provide some endpoints:

### Accounts

1. GET `/accounts/` - Return an account's list

    It can be filtered and sorted through the query param.

    Examples: `/accounts?offset=10&limit=50&sort=-firstName`

    ```
    offset : Numeric > 0

    limit : Numeric > 0

    sort : (-) String [field name]. The sort parameter contains the order (- means desc and empty means asc) + fieldName
        Examples: sort=-firstName,lastName. It will sort firstName DESC and lastName ASC
    ```

2. POST `/accounts` - Save a new account on db

    Return a succes/fail message
    Payload: 
    ```
        {
            "firstName": String,
            "lastName": String,
            "country": String,
            "email": String,
            "dob": String,
            "mfa": (multi factor authentication possible values: [null, 'TOTP', 'SMS']),
            "createdAt": Date String,
            "updatedAt": Date String,
            "referredBy": String (email of referral account)
        }
    ```
    Example:
    ```
        {
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

    ```

3. PUT `/accounts/:id` - Update an account on db

    Return a succes/fail message

    Param:
        
        id: Account id

    Payload: 
    ```
        {
            "firstName": String,
            "lastName": String,
            "country": String,
            "email": String,
            "dob": String,
            "mfa": (multi factor authentication possible values: [null, 'TOTP', 'SMS']),
            "createdAt": Date String,
            "updatedAt": Date String,
            "referredBy": String (email of referral account)
        }
    ```
    Example:
    ```
        {
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

    ```

4. GET `/accounts/:id` - Get the account information

    Return an account object
    ```
        {
            "_id": String,
            "firstName": String,
            "lastName": String,
            "country": String,
            "email": String,
            "dob": String,
            "mfa": (multi factor authentication possible values: [null, 'TOTP', 'SMS']),
            "createdAt": Date String,
            "updatedAt": Date String,
            "referredBy": String (email of referral account)
        }
    ```

    Param:
        
        id: Account id

5. GET `/accounts/:id/balance` - Get the account balance

    Return an balance object, if the account doesn't exist, it will return balance 0
    ```
        {
            "_id": String (Account id),
            "balance": Numeric
        }
    ```

    Also, it is possible take the account information passing the query parameter `?full=1`

    ```
        {
            "_id": String,
            "firstName": String,
            "lastName": String,
            "country": String,
            "email": String,
            "dob": String,
            "mfa": (multi factor authentication possible values: [null, 'TOTP', 'SMS']),
            "createdAt": Date String,
            "updatedAt": Date String,
            "referredBy": String (email of referral account),
            "balance": Numeric
        }
    ```

### Transactions

1. GET `/transactions/` - Return a transaction's list

    It can be filtered and sorted through the query param.

    Examples: `/transactions?offset=10&limit=50&sort=-firstName`

    ```
    offset : Numeric > 0

    limit : Numeric > 0

    sort : (-) String [field name]. The sort parameter contains the order (- means desc and empty means asc) + accountId
        Examples: sort=-accountId. It will sort accountId DESC
    ```

2. POST `/transactions` - Save a new transaction on db

    Return a succes/fail message
    Payload: 
    ```
        {
            "accountId": String (Account id),
            "amount": Numberic,
            "type": String (Possible values: ['send', 'receive']),
            "createdAt": Date String
        }
    ```
    Example:
    ```
        {
            "accountId": "617f20968ff6f7facb64ab5a",
            "amount": 179921838,
            "type": "receive",
            "createdAt": "2020-10-14T04:35:23.770Z"
        },

    ```

3. GET `/transactions/:id` - Get the transaction information

    Return an account object
    ```
        {
            "_id": "617f20978ff6f7facb64d27b",
            "accountId": "617f20968ff6f7facb64ab5a",
            "amount": 179921838,
            "type": "receive",
            "createdAt": "2020-10-14T04:35:23.770Z"
        }
    ```

    Param:
        
        id: Account id

5. GET `/transactions/debit/:accountId` - Make a debit on account

    Return an acknowledge object
    ```
        {
            "acknowledged": Boolean,
            "insertedId": Transaction ID
        }
    ```
6. GET `/transactions/credit/:accountId` - Make a debit on account

    Return an acknowledge object
    ```
        {
            "acknowledged": Boolean,
            "insertedId": Transaction ID
        }
    ```
7. POST `/transactions/:from/transfer/:to` - Transfer a value to another account

    Return a success/fail String

    In case of fail, it will do the rollback of the transaction.

    Params:
        
        from: The account id where the value is moving from
        to: The account id where the value is moving to

    Payload:
    ```
        {
            amount: Numeric
        }
    ```

