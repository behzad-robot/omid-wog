import MyExpressApp from "./libs/express";
import { log } from "./libs/log";
import AdminSocketRouter from './routers/admin_socket';
import { APICollection, APIProxy } from "./utils/api-helper";
// import AdminAnalyticsRouter from "./routers/admin_analytics";

import AdminGeneralRouter from "./routers/general_router";
import AdminPanelRouter from "./routers/panel_router";
import { ADMIN_URL, ADMIN_TOKEN, API_TOKEN, API_BASE_URL, GetMongoDBURL } from "./constants";
import PostsPanelRouter from "./routers/posts_router";
import GamesPanelRouter from "./routers/games_router";
import ChampionsPanelRouter from "./routers/champions_router";
import ChampionBuildsPanelRouter from "./routers/champBuilds_router";
import MediaPanelRouter from "./routers/media_router";
import PostsCatsPanelRouter from "./routers/posts_cats_router";
import CommentsPanelRouter from "./routers/comments_router";
import AdminFilesRouter from "./routers/files_router";
import UsersPanelRouter from "./routers/users_router";
import AparatAdminRouter from "./routers/aparat_router";
import SiteConfigAdminRouter from "./routers/siteConfig_router";
import Dota2QuestionsPanelRouter from "./routers/dota2_questions_router";
import SocialHashTagsPanelRouter from "./routers/social_hashtags_router";
import SocialPostsPanelRouter from "./routers/social_posts_router";
import SocialChallengesPanelRouter from "./routers/social_challenges_router";
//db:
const User = new APICollection('users', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Post = new APICollection('posts', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const PostCategory = new APICollection('posts-cats', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Game = new APICollection('games', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Admin = new APICollection('admins', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Champion = new APICollection('champions', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const ChampBuild = new APICollection('builds', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Comment = new APICollection('comments', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Media = new APICollection('media', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const AdminLog = new APICollection('admin-logs', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Dota2Question = new APICollection('dota2-questions', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const SocialPost = new APICollection('social-posts', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const SocialHashTag = new APICollection('social-hashtags', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const SocialChallenge = new APICollection('social-challenges', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const proxyAPI = new APIProxy({ apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const AdminModules = {
    User: User,
    Game: Game,
    Post: Post,
    PostCategory: PostCategory,
    Champion: Champion,
    Admin: Admin,
    Build: ChampBuild,
    Media: Media,
    Comment: Comment,
    AdminLog: AdminLog,
    Dota2Question : Dota2Question,
    SocialHashTag : SocialHashTag,
    SocialPost : SocialPost,
    SocialChallenge : SocialChallenge,
    proxyAPI: proxyAPI,
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
//log middleware:
const morgan = require('morgan');
express.expressApp.use(morgan('tiny'))
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
    if (!req.session.isAdmin || req.session.adminToken == undefined || req.method != 'GET')
    {
        res.send({ error: "Access Denied", code: 400 });
        return;
    }
    // res.send('SHINE');    
    var fullUrl = req.protocol + '://' + 'localhost:6565' + req.originalUrl;
    fullUrl = fullUrl.replace(":6565", ":8585");
    console.log(req.method + ' => ' + fullUrl);
    proxyAPI.apiCall(req.method, fullUrl, req.method == 'POST' ? req.body : {}).then((result) =>
    {
        res.send(result);
    });
});
//routers:
express.expressApp.use('/', new AdminGeneralRouter(AdminModules).router);
express.expressApp.use('/admin', new AdminPanelRouter(AdminModules).router);
express.expressApp.use('/admin/media', new MediaPanelRouter(AdminModules).router);
express.expressApp.use('/admin/posts', new PostsPanelRouter(AdminModules).router);
express.expressApp.use('/admin/posts-cats', new PostsCatsPanelRouter(AdminModules).router);
express.expressApp.use('/admin/games', new GamesPanelRouter(AdminModules).router);
express.expressApp.use('/admin/champions', new ChampionsPanelRouter(AdminModules).router);
express.expressApp.use('/admin/builds', new ChampionBuildsPanelRouter(AdminModules).router);
express.expressApp.use('/admin/comments', new CommentsPanelRouter(AdminModules).router);
express.expressApp.use('/admin/users', new UsersPanelRouter(AdminModules).router);
express.expressApp.use('/admin/dota2-questions', new Dota2QuestionsPanelRouter(AdminModules).router);

express.expressApp.use('/admin/social-hashtags', new SocialHashTagsPanelRouter(AdminModules).router);
express.expressApp.use('/admin/social-challenges', new SocialChallengesPanelRouter(AdminModules).router);
express.expressApp.use('/admin/social-posts', new SocialPostsPanelRouter(AdminModules).router);

express.expressApp.use('/admin/aparat', new AparatAdminRouter(AdminModules).router);
express.expressApp.use('/admin/site-config', new SiteConfigAdminRouter(AdminModules).router);
express.expressApp.use('/admin/files', new AdminFilesRouter(AdminModules).router);
// express.expressApp.use('/', new AdminAnalyticsRouter(AnalyticsEvent).router)

//listen:
const PORT = 6565;
express.http.listen(PORT, function ()
{
    log.success('http server listening on port ' + PORT);
});