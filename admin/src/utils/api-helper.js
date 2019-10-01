/*
    Version : 0.0.3b
*/
import fetch from 'node-fetch';
import { API_URL } from '../constants';
export class APICollection 
{
    constructor(slug, settings = { apiToken: "", adminToken: undefined })
    {
        //data:
        this.slug = slug;
        this.headers = {
            'api-token': settings.apiToken,
            'admin-token': settings.adminToken,
        }
        //bind functions:
        this.apiCall = this.apiCall.bind(this);
        this.getOne = this.getOne.bind(this);
        this.find = this.find.bind(this);
        this.insert = this.insert.bind(this);
        this.edit = this.edit.bind(this);
        this.delete = this.delete.bind(this);
        this.fileUpload = this.fileUpload.bind(this);
    }
    fileUpload(files)
    {
        var postHeaders = Object.assign({}, this.headers);
        postHeaders['Content-Type'] = 'application/json';
        var settings = {
            method: 'POST',
            headers: postHeaders,
        };
        settings.body = JSON.stringify({ files: files });
        return fetch(API_URL + 'file-upload', settings).then(res => res.text());
    }
    apiCall(query, method, body)
    {
        var postHeaders = Object.assign({}, this.headers);
        postHeaders['Content-Type'] = 'application/json';
        var settings = {
            method: method,
            headers: postHeaders,
        };
        if (method == 'POST')
            settings.body = JSON.stringify(body);
        return fetch(API_URL + this.slug + '/' + query, settings).then(res => res.text());
    }
    getOne(_id)
    {
        return fetch(API_URL + this.slug + '/' + _id + '/', {
            headers: this.headers,
        }).then(res => res.json()).then((obj) =>
        {
            return new Promise((resolve, reject) =>
            {
                if (obj.error != undefined && obj.code != undefined)
                    reject(obj.error);
                else
                    resolve(obj._data);
            });
        });
    }
    find(query = undefined, limit = 50, offset = 0)//can be anything that api supports!
    {
        var q = `?limit=${limit}&offset=${offset}`;
        if (query != undefined)
        {
            var keys = Object.keys(query);
            for (var i = 0; i < keys.length; i++)
            {
                q += "&" + keys[i] + "=" + query[keys[i]];
            }
        }
        // console.log(q);
        return new Promise((resolve, reject) =>
        {
            fetch(API_URL + this.slug + '/' + q, {
                headers: this.headers,
            }).then(res => res.json()).then(res =>
            {
                resolve(res._data);
            });
        });

    }
    insert(doc)
    {
        var postHeaders = Object.assign({}, this.headers);
        postHeaders['Content-Type'] = 'application/json';
        return fetch(API_URL + this.slug + '/new', {
            method: "POST",
            headers: postHeaders,
            body: JSON.stringify(doc),
        }).then(res => res.json()).then(res => res._data);
    }
    edit(_id, doc)
    {
        var postHeaders = Object.assign({}, this.headers);
        postHeaders['Content-Type'] = 'application/json';
        return fetch(API_URL + this.slug + '/' + _id + '/edit', {
            method: "POST",
            headers: postHeaders,
            body: JSON.stringify(doc),
        }).then(res => res.json()).then(res => res._data);
    }
    delete(_id)
    {
        return fetch(API_URL + this.slug + '/' + _id + '/delete/', {
            headers: this.headers,
        }).then(res => res.json()).then(res => res._data);
    }
}
export class APIProxy
{
    constructor(settings = { apiToken: "", adminToken: undefined })
    {
        //data:
        this.headers = {
            'api-token': settings.apiToken,
            'admin-token': settings.adminToken,
        }
        //bind functions:
        this.apiCall = this.apiCall.bind(this);
    }
    apiCall(method, url, body)
    {
        var postHeaders = Object.assign({}, this.headers);
        postHeaders['Content-Type'] = 'application/json';
        var settings = {
            method: method,
            headers: postHeaders,
        };
        if (method == 'POST')
            settings.body = JSON.stringify(body);
        return fetch(url, settings).then(res => res.text());
    }
}