"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _constants = require("../constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fileSystem = require('fs');
var path = require('path');
var mustache = require('mustache');
var Jimp = require('jimp');

var Router = function () {
    function Router() {
        _classCallCheck(this, Router);

        this.now = function () {
            return (0, _moment2.default)().format('YYYY-MM-DD hh:mm:ss');
        };

        //exports:
        this.router = _express2.default.Router();
        //function binding:
        this.now = this.now.bind(this);
        this.sendResponse = this.sendResponse.bind(this);
        this.makeAdminRouter = this.makeAdminRouter.bind(this);
        this.accessDenied = this.accessDenied.bind(this);
        this.handleFile = this.handleFile.bind(this);
        this.handleFileArray = this.handleFileArray.bind(this);
        this.renderTemplate = this.renderTemplate.bind(this);
    }

    _createClass(Router, [{
        key: "sendResponse",

        //message functions:
        value: function sendResponse(req, res, body) {
            var code = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 200;

            res.status(code).send(body);
        }
        //admin functions:

    }, {
        key: "makeAdminRouter",
        value: function makeAdminRouter() {
            var _this = this;

            this.router.use(function (req, res, next) {
                if (_this.isAdmin(req)) {
                    next();
                } else {
                    console.log('400 due to admin session');
                    _this.acccessDenied(res);
                    return;
                }
            });
        }
    }, {
        key: "accessDenied",
        value: function accessDenied(res) {
            res.status(400).send({ message: 'Access Denied!', code: 400 });
        }
        //template functions:

    }, {
        key: "renderTemplate",
        value: function renderTemplate(fileName, view) {
            if (!fileName.includes("public/")) fileName = "public/" + fileName;
            try {
                var view_str = fileSystem.readFileSync(path.resolve(fileName)).toString();
                return mustache.render(view_str, view);
            } catch (err) {
                return "render file failed =>" + err;
            }
        }
        //file functions:

    }, {
        key: "handleFile",
        value: function handleFile(req, res, name) {
            var folder = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
            var sizes = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

            if (folder != '' && folder.indexOf('/') == -1) folder += '/';
            return new Promise(function (resolve, reject) {
                try {
                    // console.log('req.files='+JSON.stringify(req.files));
                    if (req.files && req.files[name]) {
                        var f = req.files[name];
                        var fileName = (f.name.substring(0, f.name.lastIndexOf('.')) + '-' + new Date().getTime().toString()).replace(' ', '');
                        var fileFormat = f.name.substring(f.name.lastIndexOf('.'), f.name.length);
                        var filePath = '../storage/' + folder + fileName + fileFormat;
                        console.log(filePath);
                        f.mv(filePath, function (err) {
                            if (err) reject(err);else {
                                console.log('file uploaded ' + filePath);
                                if (sizes == undefined || sizes.length == 0) resolve({ path: filePath.replace('../storage/', '/storage/'), url: _constants.API_URL.replace('api/', '') + ("" + (folder + fileName + fileFormat)) });else {
                                    var _loop = function _loop() {
                                        if (sizes[i].width == -1) sizes[i].width = Jimp.AUTO;
                                        if (sizes[i].height == -1) sizes[i].height = Jimp.AUTO;
                                        var i2 = i;
                                        Jimp.read(filePath, function (err, img) {
                                            img.resize(sizes[i2].width, sizes[i2].height).quality(60).write('../storage/' + folder + fileName + '-resize-' + sizes[i2].width + 'x' + sizes[i2].height + fileFormat);
                                        });
                                    };

                                    for (var i = 0; i < sizes.length; i++) {
                                        _loop();
                                    }
                                    setTimeout(function () {
                                        resolve({ path: filePath.replace('../storage/', '/storage/'), url: _constants.API_URL.replace('api/', '') + ("" + (folder + fileName + fileFormat)) });
                                    }, 200 * sizes.length);
                                }
                            }
                        });
                    } else {
                        resolve(undefined);
                    }
                } catch (err) {
                    console.log(err);
                    reject(err);
                }
            });
            // return new Promise((resolve, reject) =>
            // {
            //     try
            //     {
            //         if (req.files && req.files[name]) 
            //         {
            //             let f = req.files[name];
            //             const fileName = (f.name.substring(0, f.name.lastIndexOf('.')) + '-' + new Date().getTime().toString()).replace(' ', '');
            //             const fileFormat = f.name.substring(f.name.lastIndexOf('.'), f.name.length);
            //             const filePath = path.resolve('public/media') + '/' + folder + fileName + fileFormat;
            //             f.mv(filePath, async (err) =>
            //             {
            //                 if (err)
            //                     reject(err);
            //                 else 
            //                 {
            //                     log.success('uploaded file =>' + fileName + fileFormat);
            //                     for (var i = 0; i < sizes.length; i++)
            //                     {
            //                         const resizePath = path.resolve('public/media') + '/' + folder + fileName + '-resize-' + sizes[i].width + 'x' + sizes[i].height + fileFormat;
            //                         console.log(resizePath)
            //                         console.log(JSON.stringify(sizes[i]));
            //                         await app.sharp(filePath).resize(sizes[i].width, sizes[i].height).toFile(resizePath);/*.then((file)=>{}).catch((err)=>{
            //                             app.log.error(err.toString);
            //                         });*/
            //                     }
            //                     console.log('ok we are done!');
            //                     resolve('/media/' + folder + fileName + fileFormat);
            //                 }
            //                 return 0;
            //             });
            //         }
            //         else
            //         {
            //             resolve(undefined);
            //         }
            //     }
            //     catch (err)
            //     {
            //         console.log(err);
            //         reject(err);
            //     }
            // });
        }
    }, {
        key: "handleFileArray",
        value: function handleFileArray(app, req, res, files, folder, callBack) {
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

            var i = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0;
            var results = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : [];
        }
    }]);

    return Router;
}();

exports.default = Router;