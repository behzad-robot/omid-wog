import MyExpressApp from "./libs/express";
import { log } from "./libs/log";
import { APICollection, APIProxy } from "./utils/api-helper";
import { API_TOKEN, ADMIN_TOKEN, GetMongoDBURL } from "./constants";
import SiteGeneralRouter from "./routers/general_router";
import { CacheReader } from "./utils/cache";
// import AdminAnalyticsRouter from "./routers/admin_analytics";

//db:
const User = new APICollection('users', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Game = new APICollection('games', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Admin = new APICollection('admins', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Champion = new APICollection('champions', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const ChampBuild = new APICollection('builds', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const ContactUsForm = new APICollection('contact-us-forms', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });

//modules:
const proxyAPI = new APIProxy({ apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const allGamesCache = new CacheReader('all-games', (cb) =>
{
    Game.find().then((games)=>{
        cb(undefined,games);
    }).catch((err)=>{
        cb(err,undefined);
    });
});
const SiteModules = {
    User: User,
    Game: Game,
    Champion: Champion,
    Admin: Admin,
    Build: ChampBuild,
    ContactUsForm : ContactUsForm,
    proxyAPI: proxyAPI,
    Cache: {
        allGames : allGamesCache,
    }
}
//express:
const express = new MyExpressApp({
    hasSessionEngine: true,
    mongoUrl: GetMongoDBURL(),
    serveFiles: ['public', {
        prefix: '/storage',
        path: '../storage',
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
    // res.send('SHINE');    
    if(req.method != 'GET')
    {
        res.send('access denied!');
        return;
    }
    if(req.query.cache)
    {
        console.log('asking for a cache huh?');
        if(req.query.cache == 'allGames')
        {
            SiteModules.Cache.allGames.getData((err,data)=>{
                if(err)
                    res.send(err.toString());
                else
                    res.send(data);
            });
        }
        return;
    }
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    fullUrl = fullUrl.replace('?cache='+req.query.cache,'');
    fullUrl = fullUrl.replace("/api", ":8585/api");
    proxyAPI.apiCall(req.method, fullUrl, req.method == 'POST' ? req.body : {}).then((result) =>
    {
        res.send(result);
    }).catch((err) =>
    {
        res.send(err.toString());
    });
});
//routers:
express.expressApp.use('/', new SiteGeneralRouter(SiteModules).router)
// express.expressApp.use('/', new AdminAnalyticsRouter(AnalyticsEvent).router)
//listen:
const PORT = 80;
express.http.listen(PORT, function ()
{
    log.success('http server listening on port ' + PORT);
});