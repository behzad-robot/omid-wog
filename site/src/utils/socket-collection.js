import { API_TOKEN, ADMIN_TOKEN } from "../constants";

export class SocketCollection
{
    constructor(modelSlug, apiSocket)
    {
        this.modelSlug = modelSlug;
        this.apiSocket = apiSocket;
        this.apiCall = this.apiCall.bind(this);
        this.find = this.find.bind(this);
        this.getOne = this.getOne.bind(this);
        this.insert = this.insert.bind(this);
        this.edit = this.edit.bind(this);
        this.delete = this.delete.bind(this);
    }
    apiCall(method, params)
    {
        return new Promise((resolve, reject) =>
        {
            this.apiSocket.apiCall(this.modelSlug, method, params, (response) =>
            {
                if (response.error == null && response.code >= 200 && response.code < 300)
                    resolve(response._data);
                else
                    reject(response.error);
            });
        });
    }
    find(params = {})
    {
        return this.apiCall('find', params);
    }
    getOne(_id)
    {
        return this.apiCall('getOne', { _id: _id });
    }
    insert(data)
    {
        return this.apiCall('insert', data);
    }
    edit(_id, data)
    {
        data._id = _id;
        return this.apiCall('edit', data);
    }
    delete(_id)
    {
        return this.apiCall('delete', { _id: _id });
    }

}