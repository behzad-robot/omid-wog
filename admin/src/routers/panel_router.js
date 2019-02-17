
import { AdminRouter } from "./admin_router";
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
export default class AdminPanelRouter extends AdminRouter
{
    constructor(adminModules)
    {
        super();
        const Admin = adminModules.AdminModel;
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
        this.router.all('/file-upload', (req, res) =>
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
            var myDir = '';
            if (req.method == 'GET')
            {
                if (req.query['my-dir'] == undefined)
                    req.query['my-dir'] = '';
                myDir = req.query['my-dir'];
            }
            else if (req.method == 'POST')
            {
                if (req.body['my-dir'] == undefined)
                    req.body['my-dir'] = '';
                myDir = req.body['my-dir'];
            }
            if (!myDir.endsWith('/'))
                myDir += '/';
            console.log('resizes=' + JSON.stringify(sizes));
            console.log('my-dir=' + req.query['my-dir']);
            this.handleFile(req, res, 'my-file', myDir, sizes).then((result) =>
            {
                if (result)
                {
                    result.link = result.path;
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
        this.router.get('/update-images-cache', (req, res) =>
        {
            var response = '';
            let filesCreated = 1;
            var _log = (msg) =>
            {
                console.log(msg);
                response += msg + '\n';
            };
            _log("Started Images Cache Checking...");
            adminModules.Media.find({}, 1000).then((media) =>
            {
                _log(`${media.length} media loaded.`);
                for (var i = 0; i < media.length; i++)
                {
                    var m = media[i];
                    const thumbPath = path.resolve(".." + m.thumbnail_url);
                    const urlPath = path.resolve(".." + m.url);
                    _log('================================');
                    _log(`checking => ${m.thumbnail_url} => ${m._id}`);
                    if (!fs.existsSync(thumbPath))
                    {
                        _log(`thumbnail not found => ${m.thumbnail_url}`);
                        if (!fs.existsSync(urlPath))
                            _log(`ERROR url not found => ${m.thumbnail_url}`);
                        else
                        {
                            _log(`creating file ${thumbPath}`);
                            filesCreated++;
                            Jimp.read(urlPath, (err, img) =>
                            {
                                if (err)
                                {
                                    _log(err);
                                    return;
                                }
                                img
                                    .cover(150, 150, Jimp.VERTICAL_ALIGN_MIDDLE)
                                    .quality(60)
                                    .write(thumbPath);
                                _log(`file created => ${thumbPath}`);
                            });
                        }
                    }
                }
                console.log(`********************************************`);
                adminModules.Post.find({}, 1000).then((posts) =>
                {
                    _log(`${posts.length} posts loadded!`);
                    for (var i = 0; i < posts.length; i++)
                    {
                        var m = posts[i];
                        let thumbPath = path.resolve(".." + m.thumbnail_150x150);
                        const orgPath = path.resolve(".." + m.thumbnail);
                        _log('================================');
                        _log(`checking => ${m.thumbnail_150x150} => ${m._id}`);
                        if (!fs.existsSync(thumbPath))
                        {
                            _log(`thumbnail_150x150 not found => ${m.thumbnail_150x150}`);
                            if (!fs.existsSync(orgPath))
                                _log(`ERROR thumbnail not found => ${m.thumbnail}`);
                            else
                            {
                                _log(`creating file ${thumbPath}`);
                                filesCreated++;
                                Jimp.read(orgPath, (err, img) =>
                                {
                                    if (err)
                                    {
                                        _log(err);
                                        return;
                                    }
                                    img
                                        .cover(150, 150)
                                        .quality(60)
                                        .write(thumbPath);
                                    _log(`file created => ${thumbPath}`);
                                });
                            }
                        }
                        thumbPath = path.resolve(".." + m.thumbnail_640x480);
                        if (!fs.existsSync(thumbPath))
                        {
                            _log(`thumbnail_640x480 not found => ${m.thumbnail_640x480}`);
                            if (!fs.existsSync(orgPath))
                                _log(`ERROR thumbnail not found => ${m.thumbnail}`);
                            else
                            {
                                _log(`creating file ${thumbPath}`);
                                filesCreated++;
                                Jimp.read(orgPath, (err, img) =>
                                {
                                    if (err)
                                    {
                                        _log(err);
                                        return;
                                    }
                                    img
                                        .cover(640, 480)
                                        .quality(60)
                                        .write(thumbPath);
                                    _log(`file created => ${thumbPath}`);
                                });
                            }
                        }
                    }
                    //finish:
                    setTimeout(() =>
                    {
                        res.send(response);
                    }, 100 * filesCreated);
                }).catch((err) =>
                {
                    res.send(response + "failed posts=>" + err.toString());
                });

            }).catch((err) =>
            {
                res.send(response + "failed media=>" + err.toString());
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