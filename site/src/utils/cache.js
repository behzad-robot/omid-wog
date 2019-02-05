const path = require('path');
const FILE_PATH = path.resolve('../storage/caches/');
const fs = require('fs');
export const updateCache = (token, cb = undefined) =>
{
    var filePath = `${FILE_PATH}/${token}.json`;
    fs.writeFile(filePath, Date.now().toString(), (err, data) =>
    {
        if (err != undefined)
            console.log("Error=" + err.toString());
        if (cb != undefined)
            cb(err, data);
    });
};
export class CacheReader
{
    constructor(token,loadData)
    {
        this.token = token;
        this.loadData = loadData;
        this._filePath = `${FILE_PATH}/${token}.json`;
        this.lastCheckedCache = -1;
        this.data = undefined;
        
    }
    getData(callback)
    {
        this.isCacheValid((valid,val)=>{
            if(valid)
                callback(undefined,this.data);
            else
            {
                this.loadData((err,d)=>{
                    this.data = d;
                    if(val != -1)
                        this.lastCheckedCache = val;
                    callback(err,d);
                });
            }
        });
    }
    isCacheValid(callBack)
    {
        fs.readFile(this._filePath, (err, data) =>
        {
            if (err)
                callBack(false,-1);
            else
            {
                var val = parseInt(data.toString());
                callBack(val == this.lastCheckedCache , val);
            }
        });
    }
}