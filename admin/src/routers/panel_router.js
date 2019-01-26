
import { AdminRouter } from "./admin_router";
import { IS_LOCALHOST, API_URL, ADMIN_URL, API_BASE_URL, ADMIN_TOKEN, ADMIN_FILE_UPLOAD } from "../constants";
import { API_TOKEN } from "../../../api/src/constants";
const multiparty = require("multiparty");
const fs = require('fs');
export default class AdminPanelRouter extends AdminRouter
{
    constructor(AdminModel)
    {
        super();
        const Admin = AdminModel;
        this.requireAdmin();
        this.router.get('/', (req, res) =>
        {
            res.send(this.renderTemplate('panel.html', {
                admin: req.session.admin
            }));
        });
        this.router.get('/file-explorer', (req, res) =>
        {
            res.send(this.renderTemplate('file-explorer.html', {
                admin: req.session.admin,
                fileUploadURL: ADMIN_FILE_UPLOAD
            }));
        });
        this.router.get('/file-load', (req, res) =>
        {
            fs.readdir('../storage/' + (req.query.folder ? req.query.folder : ''), (err, items) =>
            {
                for (var i = 0; i < items.length; i++)
                    items[i] = '/storage/' + (req.query.folder ? req.query.folder + '/' : '') + items[i];
                res.send(items);
            });
        });
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
        this.router.post('/file-delete', (req, res) =>
        {
            if (req.body.file.indexOf('/storage/') != -1)
                req.body.file = req.body.file.replace('/storage/', '../storage/');
            fs.unlink(req.body.file, (err) =>
            {
                if (err)
                    res.send(err);
                else
                    res.send("success");
            });
        });
        // this.router.post('/try-file-upload', (httpReq, httpRes) =>
        // {
        //     var form = new multiparty.Form();
        //     form.on("part", function (part)
        //     {
        //         if (part.filename)
        //         {
        //             var FormData = require("form-data");
        //             var request = require("request")
        //             var form = new FormData();
        //             form.append("my-file", part, { 'my-file': part['my-file'], contentType: part["content-type"] });
        //             var r = request.post("http://localhost:8585/api/file-upload", { "headers": { "api-token":API_TOKEN } }, function (err, res, body)
        //             {
        //                 httpRes.send(res);
        //             });
        //             r._form = form
        //         }
        //     })

        //     form.on("error", function (error)
        //     {
        //         console.log(error);
        //         httpRes.send(error);
        //     })
        //     form.parse(httpReq);
        // });
    }
}