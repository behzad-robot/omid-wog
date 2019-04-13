import express from "express";
import moment from 'moment';
import { API_TOKEN, ADMIN_URL, API_URL } from "../constants";
const fileSystem = require('fs');
const path = require('path');
const mustache = require('mustache');
const Jimp = require('jimp');

export default class Router {
    constructor() {
        //exports:
        this.router = express.Router();
        //function binding:
        this.now = this.now.bind(this);
        this.sendResponse = this.sendResponse.bind(this);
        this.makeAdminRouter = this.makeAdminRouter.bind(this);
        this.accessDenied = this.accessDenied.bind(this);
        this.handleFile = this.handleFile.bind(this);
        this.handleFileArray = this.handleFileArray.bind(this);
        this.renderTemplate = this.renderTemplate.bind(this);
    }
    now = () => {
        return moment().format('YYYY-MM-DD hh:mm:ss');
    }
    //message functions:
    sendResponse(req, res, body, code = 200) {
        res.status(code).send(body);
    }
    //admin functions:
    makeAdminRouter() {
        this.router.use((req, res, next) => {
            if (this.isAdmin(req)) {
                next();
            }
            else {
                console.log('400 due to admin session');
                this.acccessDenied(res);
                return;
            }
        });
    }
    accessDenied(res) {
        res.status(400).send({ message: 'Access Denied!', code: 400 });
    }
    //template functions:
    renderTemplate(fileName, view) {
        if (!fileName.includes("public/"))
            fileName = "public/" + fileName;
        try {
            let view_str = fileSystem.readFileSync(path.resolve(fileName)).toString();
            return mustache.render(view_str, view);
        } catch (err) {
            return "render file failed =>" + err;
        }
    }
    //file functions:
    handleFile(req, res, name, folder = '', sizes = []) {
        if (folder != '' && folder.indexOf('/') == -1)
            folder += '/';
        return new Promise((resolve, reject) => {
            try {
                // console.log('req.files='+JSON.stringify(req.files));
                if (req.files && req.files[name]) {
                    let f = req.files[name];
                    const fileName = (f.name.substring(0, f.name.lastIndexOf('.')) + '-' + new Date().getTime().toString()).replace(' ', '');
                    const fileFormat = f.name.substring(f.name.lastIndexOf('.'), f.name.length);
                    const filePath = '../storage/' + folder + fileName + fileFormat;
                    console.log(filePath);
                    f.mv(filePath, (err) => {
                        if (err)
                            reject(err);
                        else {
                            console.log('file uploaded ' + filePath);
                            if (sizes == undefined || sizes.length == 0) {
                                var path = filePath.replace('../storage/', '/storage/');
                                var url = API_URL.replace('api/', '') + `${folder + fileName + fileFormat}`;
                                path = path.replace("storage//", "storage/");
                                url = url.replace(":8585//", ":8585/");
                                resolve({ path: path, url: url });
                            }
                            else {
                                for (var i = 0; i < sizes.length; i++) {
                                    if (sizes[i].width == -1)
                                        sizes[i].width = Jimp.AUTO;
                                    if (sizes[i].height == -1)
                                        sizes[i].height = Jimp.AUTO;
                                    const i2 = i;
                                    Jimp.read(filePath, (err, img) => {
                                        img
                                            .resize(sizes[i2].width, sizes[i2].height)
                                            .quality(60)
                                            .write('../storage/' + folder + fileName + '-resize-' + sizes[i2].width + 'x' + sizes[i2].height + fileFormat)
                                    });
                                }
                                setTimeout(() => {
                                    var path = filePath.replace('../storage/', '/storage/');
                                    var url = API_URL.replace('api/', '') + `${folder + fileName + fileFormat}`;
                                    path = path.replace("storage//", "storage/");
                                    url = url.replace(":8585//", ":8585/");
                                    resolve({ path: path, url: url });
                                }, 200 * sizes.length);
                            }
                        }
                    });
                }
                else {
                    resolve(undefined);
                }
            }
            catch (err) {
                console.log(err);
                reject(err);
            }
        });
    }
    handleFileArray(app, req, res, files, folder, callBack, i = 0, results = []) {
        // try
        // {
        //     if (!files)
        //     {
        //         callBack([], null);
        //         return;
        //     }
        //     if (i >= files.length) 
        //     {
        //         callBack(results, null);
        //         return;
        //     }
        //     if (req.files && files) 
        //     {
        //         //let files = req.files[name];
        //         //console.log('images =>'+req.files.images);
        //         //console.log('images count=>'+req.files.images.length);
        //         console.log('files =>' + files);
        //         console.log('files count=>' + files.length);
        //         //console.log('all files=>'+JSON.stringify(req.files));
        //         let f = files[i];
        //         f.mv(path.resolve('public/media') + '/' + folder + f.name, (err) =>
        //         {
        //             if (err)
        //                 callBack(results, err);
        //             else 
        //             {
        //                 app.log.success('uploaded file =>' + f.name);
        //                 results.push('/media/' + folder + f.name);
        //                 this.handleFileArray(app, req, res, files, folder, callBack, i + 1, results);
        //             }
        //         });
        //     }
        //     // else
        //     //callBack(null,null);
        // }
        // catch (err)
        // {
        //     console.log(err);
        //     callBack(null, err);
        // }

    }
}