
import { ADMIN_TOKEN, API_TOKEN, API_ENCODE_KEY } from "../constants";
import APIRouter from "./api_router";

const ObjectId = require('mongoose').Types.ObjectId;

/*
    If your model has default properties defined in models/model-example.js it works with this API generator :)
    A public api shows public fields of objects in find , getOne by default
    If provdided an (header admin-token = ADMIN_TOKEN ) it will show all fields!
*/
export class PublicMongooseAPIRouter extends APIRouter
{
    constructor(model, settings = {
        apiTokenRequired: false,
    })
    {
        super();
        //data:
        this.model = model;
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
        this.router.post('/', (req, res) => { this.find(req, res, 'POST') });
        this.router.get('/:_id/', this.getOne);
        this.router.post('/new', this.insert);
        this.router.post('/:_id/edit', this.editOne);
        this.router.all('/:_id/delete', this.deleteOne);

    }
    //route functions (can be overriden in child classes)
    find(req, res, method = 'GET')
    {
        if (req.method == 'POST')
        {
            req.query = Object.assign(req.query, req.body);
        }
        // if (req.query._draft == undefined)
        //     req.query._draft =  { $ne: true };
        // else if (req.query._draft == 'all')
        //     delete (req.query._draft);
        // var allDraft = req.query._draft == 'all';
        // delete (req.query._draft);
        if (this.model.Helpers.hasDraft())
        {
            if (req.query._draft != 'all')
                req.query._draft = false;
            else
                delete (req.query._draft);
        }
        else
            delete (req.query._draft);
        var limit = req.query.limit ? Number.parseInt(req.query.limit) : 200;
        var offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
        var sort = req.query.sort ? req.query.sort : '-_id';
        delete (req.query.limit);
        delete (req.query.offset);
        delete (req.query.sort);
        if (req.query.isVas)
        {
            if (req.query.isVas == 'all')
            {
                delete (req.query.isVas);
            }
            else
            {
                req.query.isVas = req.query.isVas == 'true';
                if (!req.query.isVas)
                    req.query.isVas = { '$ne': true };
            }

        }
        else
            req.query.isVas = { '$ne': true };

        if (req.query._ids != undefined)
        {
            var options = req.query._ids.split(',');
            this.model
                .where('_id')
                .in(options)
                .limit(limit)
                .skip(offset)
                .sort(sort)
                // .lean()
                .exec((err, results) =>
                {
                    if (err)
                    {
                        this.handleError(req, res, err);
                        return;
                    }
                    // console.log("checking draft =>"+this.model.Helpers.hasDraft() +"=>"+allDraft);
                    // if (this.model.Helpers.hasDraft() && !allDraft)
                    // {
                    //     // console.log("checking draft!");
                    //     for (var i = 0; i < results.length; i++)
                    //     {
                    //         if (results[i]._draft)
                    //             results.splice(i, 1);
                    //     }
                    // }
                    if (req.header('admin-token') != ADMIN_TOKEN)
                    {
                        for (var i = 0; i < results.length; i++)
                        {
                            results[i] = this.model.Helpers.public(results[i]);
                        }
                    }
                    this.sendResponse(req, res, results);
                });
            return;
        }
        console.log(req.query);
        this.model
            .find(req.query)
            .limit(limit)
            .skip(offset)
            .sort(sort)
            // .lean()
            .exec((err, results) =>
            {
                if (err)
                {
                    this.handleError(req, res, err);
                    return;
                }
                // console.log(req.originalUrl+"checking draft =>"+this.model.Helpers.hasDraft() +"=>"+allDraft);
                // if (this.model.Helpers.hasDraft() && !allDraft)
                // {
                //     // console.log("checking draft!");
                //     for (var i = 0; i < results.length; i++)
                //     {
                //         // console.log(results[i]._draft);
                //         if (results[i]._draft)
                //             results.splice(i, 1);
                //     }
                // }
                if (req.header('admin-token') != ADMIN_TOKEN)
                {
                    for (var i = 0; i < results.length; i++)
                        results[i] = this.model.Helpers.public(results[i]);
                }
                this.sendResponse(req, res, results);
            });
    }
    getOne(req, res)
    {
        this.model
            .findOne({ _id: req.params._id })
            // .lean()
            .exec((err, result) =>
            {
                if (result == null || result == {})
                {
                    this.handleError(req, res, "Object not found!", 404);
                    return;
                }
                if (err)
                {
                    this.handleError(req, res, err);
                    return;
                }
                this.sendResponse(req, res, req.header('admin-token') != ADMIN_TOKEN ? this.model.Helpers.public(result) : result);
                //res.send((result));
            });
    }
    insert(req, res)
    {
        if (req.header('admin-token') != ADMIN_TOKEN)
        {
            this.accessDenied(res);
            return;
        }
        console.log(req.body);
        const model = this.model;
        delete (req.body._id);
        delete (req.body.createdAt);
        delete (req.body.updatedAt);
        req.body.createdAt = this.now();
        req.body.updatedAt = "";
        var doc = new model(req.body);
        doc.save().then(() =>
        {
            this.sendResponse(req, res, doc);
        }).catch((err) =>
        {
            this.handleError(req, res, err);
        });
    }
    editOne(req, res)
    {
        if (req.header('admin-token') != ADMIN_TOKEN)
        {
            this.accessDenied(res);
            return;
        }
        delete (req.body._id);
        delete (req.body.createdAt);
        delete (req.body.updatedAt);
        req.body.updatedAt = this.now();
        const _id = req.params._id;
        this.model.findByIdAndUpdate(_id, req.body, { new: true }, (err, result) =>
        {
            if (err)
            {
                this.handleError(req, res, err);
                return;
            }
            else
                this.sendResponse(req, res, result);
        });
    }
    deleteOne(req, res)
    {
        if (req.header('admin-token') != ADMIN_TOKEN)
        {
            this.accessDenied(res);
            return;
        }
        this.model.deleteOne({ _id: req.params._id }, (err) =>
        {
            res.send({ message: "DELETED " + req.params._id, error: err });
        });
    }
}