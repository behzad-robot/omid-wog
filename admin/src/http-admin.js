import MyExpressApp from "./libs/express";
import { log } from "./libs/log";
import AdminSocketRouter from './routers/admin_socket';
import { APICollection, APIProxy } from "./utils/api-helper";
// import AdminAnalyticsRouter from "./routers/admin_analytics";

import AdminGeneralRouter from "./routers/general_router";
import AdminPanelRouter from "./routers/panel_router";
import { ADMIN_URL , ADMIN_TOKEN,API_TOKEN, API_BASE_URL, GetMongoDBURL } from "./constants";
import PostsPanelRouter from "./routers/posts_router";
import GamesPanelRouter from "./routers/games_router";
import ChampionsPanelRouter from "./routers/champions_router";
import ChampionBuildsPanelRouter from "./routers/champBuilds_router";
//db:
const User = new APICollection('users', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Post = new APICollection('posts', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Game = new APICollection('games', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Admin = new APICollection('admins', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Champion = new APICollection('champions', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const ChampBuild = new APICollection('builds', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const AnalyticsEvent = new APICollection('analytics');
const proxyAPI = new APIProxy({ apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const AdminModules = {
    User : User,
    Game : Game,
    Post : Post,
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
    console.log(req.method+' => '+fullUrl);
    proxyAPI.apiCall(req.method,fullUrl, req.method == 'POST' ? req.body : {}).then((result) =>
    {
        res.send(result);
    });
});
//routers:
express.expressApp.use('/', new AdminGeneralRouter(Admin).router)
express.expressApp.use('/admin', new AdminPanelRouter(Admin).router)
express.expressApp.use('/admin/posts', new PostsPanelRouter(AdminModules).router)
express.expressApp.use('/admin/games', new GamesPanelRouter(AdminModules).router)
express.expressApp.use('/admin/champions', new ChampionsPanelRouter(AdminModules).router)
express.expressApp.use('/admin/builds', new ChampionBuildsPanelRouter(AdminModules).router)
// express.expressApp.use('/', new AdminAnalyticsRouter(AnalyticsEvent).router)

//listen:
const PORT = 6565;
express.http.listen(PORT, function ()
{
    log.success('http server listening on port ' + PORT);
});