import Router from "./router";

export class CommonMonkAPIRouter extends Router
{
    constructor(monkCollection)
    {
        super();
        /*
            paging => ?limit=N&offset=N*(page-1)
            filter  => ?fieldName=val1&field2=val2
            sort => ?sort=fieldName Or ?sort=-fieldName
        */
        this.router.get('/', (req, res) =>
        {
            var limit = req.query.limit ? Number.parseInt(req.query.limit) : 50;
            var offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
            var sort = req.query.sort ? req.query.sort : '';
            delete (req.query.limit);
            delete (req.query.offset);
            delete (req.query.sort);
            monkCollection.find(req.query, { limit: limit, skip: offset, sort: sort }).then((docs) =>
            {
                this.sendResponse(req, res, docs);
            }).catch((err) =>
            {
                err = err.toString();
                this.sendResponse(req, res, { error: (err != null && err != "" ? err : "Null") }, 500);
            });
        });
        this.router.get('/:_id/', (req, res) =>
        {
            monkCollection.getOne(req.params._id).then((doc) =>
            {
                this.sendResponse(req, res, doc);
            }).catch((err) =>
            {
                err = err.toString();
                this.sendResponse(req, res, { error: (err != null && err != "" ? err : "Null") }, 500);
            });
        });
        this.router.post('/new', (req, res) =>
        {
            delete (req.body._id);
            req.body.createdAt = this.now();
            req.body.updatedAt = "";
            monkCollection.insert(req.body).then((doc) =>
            {
                this.sendResponse(req, res, doc);
            }).catch((err) =>
            {
                err = err.toString();
                this.sendResponse(req, res, { error: (err != null && err != "" ? err : "Null") }, 500);
            });
        });
        this.router.post('/edit/:_id/', (req, res) =>
        {
            delete (req.body._id);
            req.body.updatedAt = this.now();
            monkCollection.editOne(req.params._id, { $set: req.body }).then((result) =>
            {
                if (result.ok != 1)
                {
                    this.sendResponse(req, res, { error: JSON.stringify(result) }, 500);
                    return;
                }
                monkCollection.getOne(req.params._id).then((doc) =>
                {
                    this.sendResponse(req, res, doc);
                }).catch((err) =>
                {
                    err = err.toString();
                    this.sendResponse(req, res, { error: (err != null && err != "" ? err : "Null") }, 500);
                });
            }).catch((err) =>
            {
                err = err.toString();
                this.sendResponse(req, res, { error: (err != null && err != "" ? err : "Null") }, 500);
            });
        });
        this.router.all('/delete/:_id/', (req, res) =>
        {
            console.log(req.params._id);
            monkCollection.deleteOne(req.params._id).then((result) => {
                this.sendResponse(req,res,result);
             }).catch((err) =>
            {
                err = err.toString();
                this.sendResponse(req, res, { error: (err != null && err != "" ? err : "Null") }, 500);
            });;
        });
    }
}