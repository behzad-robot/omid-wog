"use strict";

var _express = require("./libs/express");

var _express2 = _interopRequireDefault(_express);

var _log = require("./libs/log");

var _apiHelper = require("./utils/api-helper");

var _constants = require("./constants");

var _general_router = require("./routers/general_router");

var _general_router2 = _interopRequireDefault(_general_router);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import AdminAnalyticsRouter from "./routers/admin_analytics";

//db:
var User = new _apiHelper.APICollection('users', { apiToken: _constants.API_TOKEN, adminToken: _constants.ADMIN_TOKEN });
var Game = new _apiHelper.APICollection('games', { apiToken: _constants.API_TOKEN, adminToken: _constants.ADMIN_TOKEN });
var Admin = new _apiHelper.APICollection('admins', { apiToken: _constants.API_TOKEN, adminToken: _constants.ADMIN_TOKEN });
var Champion = new _apiHelper.APICollection('champions', { apiToken: _constants.API_TOKEN, adminToken: _constants.ADMIN_TOKEN });
var ChampBuild = new _apiHelper.APICollection('builds', { apiToken: _constants.API_TOKEN, adminToken: _constants.ADMIN_TOKEN });
var proxyAPI = new _apiHelper.APIProxy({ apiToken: _constants.API_TOKEN, adminToken: _constants.ADMIN_TOKEN });
var SiteModules = {
    User: User,
    Game: Game,
    Champion: Champion,
    Admin: Admin,
    Build: ChampBuild,
    proxyAPI: proxyAPI
    //express:
};var express = new _express2.default({
    hasSessionEngine: true,
    mongoUrl: (0, _constants.GetMongoDBURL)(),
    serveFiles: ['public', {
        prefix: '/storage',
        path: '../storage'
    }]
});
express.expressApp.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
//add general middlewares here:
express.expressApp.disable('etag'); //fully disable cache!
//proxy for api:
express.expressApp.all('/api/*', function (req, res) {
    if (!req.session.isAdmin || req.session.adminToken == undefined || req.method != 'GET') {
        res.send({ error: "Access Denied", code: 400 });
        return;
    }
    // res.send('SHINE');    
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    fullUrl = fullUrl.replace(":6565", ":8585");
    console.log(fullUrl);
    proxyAPI.apiCall(req.method, fullUrl, req.method == 'POST' ? req.body : {}).then(function (result) {
        res.send(result);
    });
});
//routers:
express.expressApp.use('/', new _general_router2.default(Admin).router);
// express.expressApp.use('/', new AdminAnalyticsRouter(AnalyticsEvent).router)
//listen:
var PORT = 80;
express.http.listen(PORT, function () {
    _log.log.success('http server listening on port ' + PORT);
});