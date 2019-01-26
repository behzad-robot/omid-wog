import APIRouter from "./api_router";
import { IS_LOCALHOST, API_TOKEN, ADMIN_TOKEN } from "../constants";
const fs = require('fs');
const path = require('path');
/*
    DEPRECATED!!!!!!!!!!!!!!!!!!!!!!!!
*/
export class FileUploaderRouter extends APIRouter
{
    constructor()
    {
        super();
        // this.apiTokenRequired();
        // this.adminTokenRequired();
        this.router.post('/file-upload', (req, res) =>
        {
            var sizes = [];
            if (req.query.sizes)
            {
                var strs = req.query.sizes.split(',');

                for (var i = 0; i < strs.length; i++)
                {
                    if (strs[i].indexOf('x') != -1)
                    {
                        var parts = strs[i].split('x');
                        sizes.push({
                            width: parseInt(parts[0]),
                            height: parseInt(parts[1]),
                        });
                    }
                    else
                    {
                        var s = parseInt(strs[i]);
                        sizes.push({ width: s, height: s });
                    }
                }
            }
            if (req.query['my-dir'] == undefined)
                req.query['my-dir'] = '';
            console.log('resizes=' + JSON.stringify(sizes));
            console.log('my-dir=' + req.query['my-dir']);
            this.handleFile(req, res, 'my-file', req.query['my-dir'], sizes).then((result) =>
            {
                if (result)
                {
                    res.send(result);
                    // if (req.query.redirect == undefined)
                    //     res.send(result);
                    // else
                    // {
                    //     res.redirect(req.query.redirect + '?fileUrl=' + result.url);
                    // }
                }
                else
                    this.handleError(req, res, "nothing to upload!", 500);
            }).catch((err) =>
            {
                this.handleError(req, res, err.toString(), 500);
            });
        });
    }
}
