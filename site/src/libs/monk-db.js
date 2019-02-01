export class MonkDatabase
{
    constructor(mongoUrl)
    {
        //exports:
        this.db = require('monk')(mongoUrl);
        //function binding:
        this.getCollection = this.getCollection.bind(this);
    }
    getCollection(name, settings = undefined)
    {
        if (settings == undefined)
            return new Collection(this.db.get(name));
        else
            return new Collection(this.db.get(name), settings);
    }
}
export class Collection
{
    constructor(collection, settings = {
        privateFields: [],
    })
    {
        //exports:
        this.collection = collection;
        this.name = this.collection.name;
        this.settings = settings;
        //function binding:
        this.getOne = this.getOne.bind(this);
        this.find = this.find.bind(this);
    }
    getOne(_id)
    {
        return new Promise((resolve, reject) =>
        {
            this.collection.findOne({ _id: _id }).then((doc) =>
            {
                if (this.settings != undefined && this.settings.privateFields != undefined && this.settings.privateFields.length != 0)
                {
                    for (var i = 0; i < this.settings.privateFields.length; i++)
                        delete (doc[this.settings.privateFields[i]]);
                    resolve(doc);
                }
                else
                    resolve(doc);
            }).catch(reject);
        });
    }
    find(condition, options = {})
    {
        return new Promise((resolve, reject) =>
        {
            this.collection.find(condition, options).then((docs) =>
            {
                if (this.settings != undefined && this.settings.privateFields != undefined && this.settings.privateFields.length != 0)
                {
                    for (var j = 0; j < docs.length; j++)
                    {
                        for (var i = 0; i < this.settings.privateFields.length; i++)
                            delete (docs[j][this.settings.privateFields[i]]);
                    }
                    resolve(docs);
                }
                else
                    resolve(docs);
            }).catch(reject);
        })
    }
    insert(data)
    {
        return this.collection.insert(data);
    }
    editOne(_id, data)
    {
        return this.collection.update({ _id: _id }, data);
    }
    deleteOne(_id)
    {
        return this.collection.remove({ _id: _id });
    }
}