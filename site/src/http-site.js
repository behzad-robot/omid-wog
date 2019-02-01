import MyExpressApp from "./libs/express";
import { log } from "./libs/log";
import { APICollection, APIProxy } from "./utils/api-helper";
// import AdminAnalyticsRouter from "./routers/admin_analytics";

//db:
const User = new APICollection('users', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Game = new APICollection('games', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Admin = new APICollection('admins', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Champion = new APICollection('champions', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const ChampBuild = new APICollection('builds', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const proxyAPI = new APIProxy({ apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const SiteModules = {
    User : User,
    Game : Game,
    Champion  : Champion,
    Admin  : Admin,
    Build : ChampBuild,
    proxyAPI : proxyAPI,
}
//express:
const express = new MyExpressApp({
    hasSessionEngine: true,
    mongoUrl: GetMongoDBURL(),
    serveFiles: ['public',{
        prefix : '/storage',
        path : '../storage',
    }],
});
express.expressApp.all('*', (req, res, next) =>
{
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
//add general middlewares here:
express.expressApp.disable('etag'); //fully disable cache!
//proxy for api:
express.expressApp.all('/api/*', (req, res) =>
{
    if(!req.session.isAdmin || req.session.adminToken == undefined || req.method != 'GET')
    {
        res.send({error:"Access Denied",code:400});
        return;
    }
    // res.send('SHINE');    
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    fullUrl = fullUrl.replace(":6565",":8585");
    console.log(fullUrl);
    proxyAPI.apiCall(req.method,fullUrl, req.method == 'POST' ? req.body : {}).then((result) =>
    {
        res.send(result);
    });
});
//routers:
express.expressApp.use('/', new SiteGeneralRouter(Admin).router)
// express.expressApp.use('/', new AdminAnalyticsRouter(AnalyticsEvent).router)
//listen:
const PORT = 80;
express.http.listen(PORT, function ()
{
    log.success('http server listening on port ' + PORT);
});