const client = require('../../libraries/data-provider.mongodb');
var ObjectId = require('mongodb').ObjectId; 

module.exports = class GenericService {
    constructor(collectionName) {
        this.dbName = "account-transactions"
        this.collectionName = collectionName;
    }
  
    connect() {
      const self = this;
      return client.connect().then( () => {
        self.db = client.db(self.dbName);
        self.collection = self.db.collection(self.collectionName);
      });
    }

    find(id) {
        var o_id = new ObjectId(id);
        return this.collection.findOne({_id: o_id})
        .then((result=> {
          if(!result) {
            throw {status: 404, message: "Element `"+id+"` not found on collection `"+this.collectionName+"`."};
          }
          return result;
        }));
    }
      
    findAll(offset, limit, sort) {
      let mapSort;
      if (sort) {
        mapSort = {};
        sort.split(",").forEach( (s) => {
          let descAsc = s[0].indexOf("-") > -1? -1: 1;
          let field = s.replace("-", "");
          mapSort[field] = descAsc
        });
      }
      return this.collection.find({})
        .skip(Number(offset || 0))
        .sort(mapSort || {firstName: 1})
        .limit(Number(limit || 10));
    }

    save(obj) {
        return this.collection.insertOne(obj);
    }

    async update(id, obj) {
        var o_id = new ObjectId(id);
        let element = await this.collection.findOne({_id: o_id});
        if (element) {
          return this.collection.updateOne({_id: o_id}, {$set: obj}, {upsert:false});
        } else {
          return Promise.reject({status: 404, message: "Element not found"});
        }
    }
  
  }