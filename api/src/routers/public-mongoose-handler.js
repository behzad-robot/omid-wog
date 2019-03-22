import APIRouter from "./api_router";

export class MongooseAPIHandler
{
    constructor(model)
    {
        this.model = model;
        this.now = this.now.bind(this);
        this.find = this.find.bind(this);
        this.getOne = this.getOne.bind(this);
        this.insert = this.insert.bind(this);
        this.editOne = this.editOne.bind(this);
        this.deleteOne = this.deleteOne.bind(this);
    }
    now = () =>
    {
        return moment().format('YYYY-MM-DD hh:mm:ss');
    }
    find(params)
    {

    }
    getOne(_id)
    {

    }
    insert(data)
    {

    }
    editOne(_id, data)
    {

    }
    deleteOne(_id)
    {

    }
}
export class PublicMongooseHttpAPI extends APIRouter
{
    constructor(handler, settings = {
        apiTokenRequired: false,
    })
    {
        super();
        //data:
        this.handler = handler;
        //bind functions:
        this.handleError = this.handleError.bind(this);
        this.find = this.find.bind(this);
        this.getOne = this.getOne.bind(this);
        this.insert = this.insert.bind(this);
        this.editOne = this.editOne.bind(this);
        this.deleteOne = this.deleteOne.bind(this);


        //activate middlwares:
        if (settings.apiTokenRequired)
            this.apiTokenRequired();
        if (settings.adminTokenRequired)
            this.adminTokenRequired();

        /*
            paging => ?limit=N&offset=N*(page-1)
            filter  => ?fieldName=val1&field2=val2
            sort => ?sort=fieldName Or ?sort=-fieldName
        */
        this.router.get('/', this.find);
        this.router.post('/', this.find);
        this.router.get('/:_id/', this.getOne);
        this.router.post('/new', this.insert);
        this.router.post('/:_id/edit', this.editOne);
        this.router.all('/:_id/delete', this.deleteOne);
    }
    find(req, res)
    {
        if (req.method == 'POST')
        {
            req.query = Object.assign(req.query, req.body);
        }
        this.handler.find(req.query).then((result) =>
        {
            this.sendResponse(req, res, result);
        }).catch((err) =>
        {
            var code = err.code ? err.code : 500;
            this.sendResponse(req, res, err, code);
        });
    }
    getOne(req, res)
    {
        this.handler.find(req.params._id).then((result) =>
        {
            this.sendResponse(req, res, result);
        }).catch((err) =>
        {
            var code = err.code ? err.code : 500;
            this.sendResponse(req, res, err, code);
        });
    }
    insert(req, res)
    {
        if (req.header('admin-token') != ADMIN_TOKEN)
        {
            this.accessDenied(res);
            return;
        }
        this.handler.insert(req.body).then((result) =>
        {
            this.sendResponse(req, res, result);
        }).catch((err) =>
        {
            var code = err.code ? err.code : 500;
            this.sendResponse(req, res, err, code);
        });
    }
    editOne(req, res)
    {
        if (req.header('admin-token') != ADMIN_TOKEN)
        {
            this.accessDenied(res);
            return;
        }
        this.handler.editOne(req.params._id, req.body).then((result) =>
        {
            this.sendResponse(req, res, err, code);
        }).catch((err) =>
        {
            var code = err.code ? err.code : 500;
            res.status(code).send(err);
        });
    }
}