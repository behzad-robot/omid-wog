import { ADMIN_TOKEN, API_TOKEN, API_ENCODE_KEY } from "../constants";
import { SocketRouter } from "./socket_router";
import moment from 'moment';
const ObjectId = require('mongoose').Types.ObjectId;
export class PublicMongooseWSRouter extends SocketRouter
{
    constructor(modelSlug, model, settings = {
        apiTokenRequired: false
    })
    {
        super();
        this.model = model;
        this.modelSlug = modelSlug;
        //bind functions:
        this.now = this.now.bind(this);
        this.find = this.find.bind(this);
        this.getOne = this.getOne.bind(this);
        this.insert = this.insert.bind(this);
        this.editOne = this.editOne.bind(this);
        this.deleteOne = this.deleteOne.bind(this);
        this.onMessage = (socket, request) =>
        {
            if (!this.isValidRequest())
                this.handleError(socket, 'Access Denied');
            socket.isAdmin = request._headers['admin-token'] == ADMIN_TOKEN;
            if (request.model != this.modelSlug)
                return;
            if (request.params == undefined)
                request.params = {};
            if (request.method == 'find')
                this.find(socket, request);
            else if (request.method == 'getOne')
                this.getOne(socket, request);
            else if (request.method == 'insert')
                this.insert(socket, request);
            else if (request.method == 'editOne' || request.method == 'edit')
                this.editOne(socket, request);
            else if (request.method == 'deleteOne' || request.method == 'delete')
                this.deleteOne(socket, request);
        };
    }
    now = () =>
    {
        return moment().format('YYYY-MM-DD hh:mm:ss');
    }
    find(socket, request)
    {
        let params = request.params;
        // console.log(params);
        // var allDraft = params._draft == 'all';
        // delete (params._draft);
        if (this.model.Helpers.hasDraft())
        {
            if(params._draft != 'all')
                params._draft = false;
            else
                delete(params._draft);
        }
        else
            delete (params._draft);
        var limit = params.limit ? params.limit : 50;
        // console.log('ask for =>' + request.model + '=>' + params.limit);
        var offset = params.offset ? params.offset : 0;
        var sort = params.sort ? params.sort : '-_id';
        var publicCast = params._publicCast ? params._publicCast : false;
        // console.log(`publicCast=>${publicCast}`);
        delete (params._publicCast);
        delete (params.limit);
        delete (params.offset);
        delete (params.sort);
        if (params._ids != undefined)
        {
            if (typeof params._ids == 'string')
                params._ids = params._ids.split(',');
            // console.log(params._ids);
            this.model
                .where('_id')
                .in(params._ids)
                .limit(limit)
                .skip(offset)
                .sort(sort)
                // .lean()
                .exec((err, results) =>
                {
                    if (err)
                    {
                        this.handleError(socket, request, err);
                        return;
                    }
                    // if (this.model.Helpers.hasDraft() && !allDraft)
                    // {
                    //     // console.log("checking draft!");
                    //     for (var i = 0; i < results.length; i++)
                    //     {
                    //         if (results[i]._draft)
                    //             results.splice(i, 1);
                    //     }
                    // }
                    if (!socket.isAdmin || publicCast)
                    {
                        for (var i = 0; i < results.length; i++)
                        {
                            results[i] = this.model.Helpers.public(results[i]);
                        }
                    }
                    this.sendResponse(socket, request, results);
                });
            return;
        }
        this.model
            .find(params)
            .limit(limit)
            .skip(offset)
            .sort(sort)
            .exec((err, results) =>
            {
                if (err)
                {
                    this.handleError(socket, request, err);
                    return;
                }
                // if (this.model.Helpers.hasDraft() && !allDraft)
                // {
                //     for (var i = 0; i < results.length; i++)
                //     {posts-grid
                //         if (results[i]._draft)
                //             results.splice(i, 1);
                //     }
                // }
                if (!socket.isAdmin || publicCast)
                {
                    for (var i = 0; i < results.length; i++)
                        results[i] = this.model.Helpers.public(results[i]);
                }
                this.sendResponse(socket, request, results);
            });
    }
    getOne(socket, request)
    {
        var params = request.params;
        var publicCast = params._publicCast ? _publicCast : false;
        delete (params._publicCast);
        this.model
            .findOne({ _id: params._id })
            // .lean()
            .exec((err, result) =>
            {
                if (result == null || result == {})
                {
                    this.handleError(socket, request, "Object not found!", 404);
                    return;
                }
                if (err)
                {
                    this.handleError(socket, request, err);
                    return;
                }
                if (!socket.isAdmin || publicCast)
                    result = this.model.Helpers.public(result);
                this.sendResponse(socket, request, result);
            });
    }
    insert(socket, request)
    {
        let params = request.params;
        delete (params._id);
        delete (params.createdAt);
        delete (params.updatedAt);
        params.createdAt = this.now();
        params.updatedAt = "";
        var doc = new this.model(params);
        doc.save().then(() =>
        {
            this.sendResponse(socket, request, doc);
        }).catch((err) =>
        {
            this.handleError(socket, request, err);
        });
    }
    editOne(socket, request)
    {
        let params = request.params;
        const _id = params._id;
        delete (params._id);
        delete (params.createdAt);
        delete (params.updatedAt);
        params.updatedAt = this.now();
        this.model.findByIdAndUpdate(_id, params, { new: true }, (err, result) =>
        {
            if (err)
            {
                this.handleError(socket, request, err);
                return;
            }
            else
                this.sendResponse(socket, request, result);
        });
    }
    deleteOne(socket, request)
    {
        let params = request.params;
        this.model.deleteOne({ _id: params._id }, (err) =>
        {
            if (err)
                this.handleError(socket, request, err);
            else
                this.sendResponse(socket, request, params);
            // this.sendResponse({ message: "DELETED " + params._id, error: err });
        });
    }
}