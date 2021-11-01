const errorHandler = require("../utility/error.handler");

module.exports = (router, service) => {

    router.get('/', async (req, res, next) => {
        console.debug("Query Params:");
        console.debug(req.query);
        
        service.connect().then(() => {
            service.findAll(req.query.offset, req.query.limit, req.query.sort)
            .toArray((err, results) => {
                if (err){
                    res.status = 500;
                    res.json(err.message);
                } else {
                    res.json(results);
                }
            });
        }).catch( (e) => {
            errorHandler(res, e);
        });
    
    });

    router.get('/:id', async (req, res, next) => {
        console.debug("Params:");
        console.debug(req.params);

        service.connect().then(() => {
            service.find(req.params.id)
            .then((result) => {
                res.json(result);
            }).catch(e => {
                errorHandler(res, e);
            });
        }).catch( (e) => {
            errorHandler(res, e);
        });
    
    });


    router.post('/', async (req, res, next) => {
        console.debug(req.body);

        service.connect().then(() => {
            service.save(req.body)
            .then(result =>{
                res.send("Element " + result.insertedId + " inserted.");
            }).catch( (e) => {
                errorHandler(res, e);
            });
        }).catch( (e) => {
            errorHandler(res, e);
        });
    
    });

    router.put('/:id', async (req, res, next) => {
        console.debug(req.body);

        service.connect().then(() => {
            service.update(req.params.id,req.body)
            .then((result) => {
                res.send("Element " + req.params.id + " updated.");
            }).catch( (e) => {
                errorHandler(res, e);
            });
        }).catch( (e) => {
            errorHandler(res, e);
        });
    
    });

    return router;
};
