import { ADMIN_TOKEN, API_TOKEN, API_ENCODE_KEY } from "../constants";
import { JesEncoder } from "../utils/jes-encoder";

const ObjectId = require('mongoose').Types.ObjectId;
const encoder = new JesEncoder(API_ENCODE_KEY);
export class PublicMongooseWSRouter
{
    constructor(modelSlug, model, settings = {
        apiTokenRequired: false
    })
    {
        this.model = model;
        this.modelSlug = modelSlug;
        //bind functions:
        this.handleError = this.handleError.bind(this);
        this.find = this.find.bind(this);
        this.getOne = this.getOne.bind(this);
        this.insert = this.insert.bind(this);
        this.editOne = this.editOne.bind(this);
        this.deleteOne = this.deleteOne.bind(this);
        this.onMessage = (socket, request) =>
        {
            if (request._headers == undefined || request._headers['api-token'] != API_TOKEN)
            {
                this.handleError(socket, 'Access Denied');
                return;
            }
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
    handleError(socket, request, error, code = 500)
    {
        socket.send({ code: code, error: error, _data: null, request: request });
    }
    sendResponse(socket, request, data, code = 200)
    {
        if (socket.isAdmin)
            socket.send({ code: code, error: null, _data: data, request: request });
        else
            socket.send({ code: code, error: null, _data: encoder.encode(data), request: request });
    }
    find(socket, request)
    {
        let params = request.params;
        var allDraft = params._draft == 'all';
        delete (params._draft);
        var limit = params.limit ? params.limit : 50;
        var offset = params.offset ? params.offset : 0;
        var sort = params.sort ? params.sort : '';
        delete (params.limit);
        delete (params.offset);
        delete (params.sort);
        if (params._ids != undefined)
        {
            if (typeof params._ids == 'string')
                params._ids = params._ids.split(',');
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
                        this.handleError(socket, request, err);
                        return;
                    }
                    if (this.model.Helpers.hasDraft() && !allDraft)
                    {
                        // console.log("checking draft!");
                        for (var i = 0; i < results.length; i++)
                        {
                            if (results[i]._draft)
                                results.splice(i, 1);
                        }
                    }
                    if (!socket.isAdmin)
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
                    this.handleError(socket , request , err);
                    return;
                }
                if (this.model.Helpers.hasDraft() && !allDraft)
                {
                    for (var i = 0; i < results.length; i++)
                    {
                        if (results[i]._draft)
                            results.splice(i, 1);
                    }
                }
                if (!socket.isAdmin)
                {
                    for (var i = 0; i < results.length; i++)
                        results[i] = this.model.Helpers.public(results[i]);
                }
                this.sendResponse(socket , request , results);
            });
    }
    getOne(socket, request)
    {
        this.model
            .findOne({ _id: params._id })
            // .lean()
            .exec((err, result) =>
            {
                if (result == null || result == {})
                {
                    this.handleError(socket , request , "Object not found!", 404);
                    return;
                }
                if (err)
                {
                    this.handleError(socket, request , err);
                    return;
                }
                if (!socket.isAdmin)
                    result = this.model.Helpers.public(result);
                this.sendResponse(socket , request , result);
            });
    }
    insert(socket, request)
    {
        delete (params._id);
        delete (params.createdAt);
        delete (params.updatedAt);
        params.createdAt = this.now();
        params.updatedAt = "";
        var doc = new model(params);
        doc.save().then(() =>
        {
            this.sendResponse(socket , request , doc);
        }).catch((err) =>
        {
            this.handleError(socket , request , err);
        });
    }
    editOne(socket, request)
    {
        const _id = params._id;
        delete (params._id);
        delete (params.createdAt);
        delete (params.updatedAt);
        params.updatedAt = this.now();
        this.model.findByIdAndUpdate(_id, params, { new: true }, (err, result) =>
        {
            if (err)
            {
                this.handleError(socket , request , err);
                return;
            }
            else
                this.sendResponse(socket , request , result);
        });
    }
    deleteOne(socket, request)
    {
        this.model.deleteOne({ _id: params._id }, (err) =>
        {
            if (err)
                this.handleError(socket , request , err);
            else
                this.sendResponse(socket , request , params);
            // this.sendResponse({ message: "DELETED " + params._id, error: err });
        });
    }
}