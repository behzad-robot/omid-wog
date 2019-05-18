
import { log } from './libs/log';
import MyExpressApp from './libs/express';

import { User } from './models/user';
import { Game } from './models/game';
import { PubGTeam } from './models/pubg_team';
import { AnalyticsEvent } from './models/analytics';
import MongooseDB from './libs/mongoose-db';


import { UsersAuthHandler } from './routers/users_auth_router';
import { PublicMongooseAPIRouter } from './routers/public-http-mongoose';
import { AppInfoHttpRouter, AppInfoSocketRouter } from './routers/app_info_router';
import { IS_LOCALHOST, GetMongoDBURL, ADMIN_TOKEN, API_TOKEN } from './constants';
//media:
import { Post } from './models/post';
import { Champion } from './models/champion';
import { ChampionBuild } from './models/champBuild';
import { ContactUsForm } from './models/contactUsForm';
import { Media } from './models/media';
import { PostCategory } from './models/postCat';
import { Comment } from './models/comment';
import { EasySocket } from './libs/easy-socket';
import { PublicMongooseWSRouter } from './routers/public-ws-mongoose';
import { BackupRouter } from './routers/backup_router';
import { OTPObject } from './models/otpObject';
import { OTPHandler } from './routers/otp_handler';
import { PostsHandler } from './routers/posts_router';
import { CommentsHandler } from './routers/comments_handler';
import { AdminLog } from './models/admin_log';
import { FortniteTournomentHandler } from './routers/users_fortnite_handler';
import { DotaBookHandler } from './routers/dota_book_handler';
import { BuildsExtraHandler } from './routers/builds_extra_handler';

const morgan = require('morgan');

const express = new MyExpressApp({
    hasSessionEngine: false,
    mongoUrl: GetMongoDBURL(),
    serveFiles: '../storage'
});
express.expressApp.all('*', (req, res, next) =>
{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
console.log('running localhost?=>' + IS_LOCALHOST());
const db = new MongooseDB(GetMongoDBURL());
db.schemas.User = User;
db.schemas.Game = Game;
//log middleware:
express.expressApp.use(morgan('tiny'))
//add routers here:
express.expressApp.get('/', (req, res) =>
{
    res.status(200).send('Welcome to API :)');
});
express.expressApp.use('/api/', new AppInfoHttpRouter().router);
express.expressApp.use('/api/analytics/', new PublicMongooseAPIRouter(AnalyticsEvent, { apiTokenRequired: true }).router);
//users:
const usersAuthHandler = new UsersAuthHandler(User);
const fortniteHandler = new FortniteTournomentHandler(User);
const dota2BookHandler = new DotaBookHandler(User);
express.expressApp.use('/api/users/', usersAuthHandler.httpRouter.router);
express.expressApp.use('/api/users/', fortniteHandler.httpRouter.router);
express.expressApp.use('/api/users/', new PublicMongooseAPIRouter(User, { apiTokenRequired: true }).router);
express.expressApp.use('/api/dota2-book/',dota2BookHandler.httpRouter.router);

//otpObjects:
const otpHandler = new OTPHandler(OTPObject);
express.expressApp.use('/api/otpObjects/', new PublicMongooseAPIRouter(OTPObject, { apiTokenRequired: true }).router);
express.expressApp.use('/api/otpObjects/', otpHandler.httpRouter.router);
//games , champions , champBuilds:
express.expressApp.use('/api/games/', new PublicMongooseAPIRouter(Game, { apiTokenRequired: true }).router);
express.expressApp.use('/api/champions/', new PublicMongooseAPIRouter(Champion, { apiTokenRequired: true }).router);
const buildsExtraHandler = new BuildsExtraHandler(ChampionBuild);
express.expressApp.use('/api/builds/', new PublicMongooseAPIRouter(ChampionBuild, { apiTokenRequired: true }).router);
express.expressApp.use('/api/builds/',buildsExtraHandler.httpRouter.router);
//posts:
const postsHandler = new PostsHandler(Post);
express.expressApp.use('/api/posts/', postsHandler.httpRouter.router);
express.expressApp.use('/api/posts/', new PublicMongooseAPIRouter(Post, { apiTokenRequired: true }).router);
express.expressApp.use('/api/posts-cats/', new PublicMongooseAPIRouter(PostCategory, { apiTokenRequired: true }).router);
//comments:
var commentsHandler = new CommentsHandler(Comment);
express.expressApp.use('/api/comments/', new PublicMongooseAPIRouter(Comment, { apiTokenRequired: true }).router);
express.expressApp.use('/api/comments/', commentsHandler.httpRouter.router);

//media:
express.expressApp.use('/api/media/', new PublicMongooseAPIRouter(Media, { apiTokenRequired: true }).router);
//contact us:
express.expressApp.use('/api/contact-us-forms/', new PublicMongooseAPIRouter(ContactUsForm, { apiTokenRequired: true }).router);
//tournoment:
express.expressApp.use('/api/pubg-teams/', new PublicMongooseAPIRouter(PubGTeam, { apiTokenRequired: true }).router);
//admin logs:
express.expressApp.use('/api/admin-logs/', new PublicMongooseAPIRouter(AdminLog, { apiTokenRequired: true }).router);
//backup
express.expressApp.use('/api/backup/', new BackupRouter({ User: User, Game: Game, Champion: Champion, Build: ChampionBuild, Post: Post, PostCategory: PostCategory, Media: Media, Comment: Comment, ContactUsForm: ContactUsForm }, { apiTokenRequired: true }).router);
//listen:
const PORT = 8585;
express.http.listen(PORT, function ()
{
    log.success('http server listening on port ' + PORT);
});
const WSRouters = [
    //users:
    new PublicMongooseWSRouter('users', User, { apiTokenRequired: true }),
    usersAuthHandler.socketRouter,
    fortniteHandler.socketRouter,
    dota2BookHandler.socketRouter,
    //otp objects:
    new PublicMongooseWSRouter('otpObjects', OTPObject, { apiTokenRequired: true }),
    otpHandler.socketRouter,

    //games & champs & builds:
    new PublicMongooseWSRouter('games', Game, { apiTokenRequired: true }),
    new PublicMongooseWSRouter('champions', Champion, { apiTokenRequired: true }),
    new PublicMongooseWSRouter('builds', ChampionBuild, { apiTokenRequired: true }),
    buildsExtraHandler.socketRouter,
    //posts & comments:
    new PublicMongooseWSRouter('posts-cats', PostCategory, { apiTokenRequired: true }),
    new PublicMongooseWSRouter('posts', Post, { apiTokenRequired: true }),
    postsHandler.socketRouter,
    new PublicMongooseWSRouter('comments', Comment, { apiTokenRequired: true }),
    commentsHandler.socketRouter,
    //media:
    new PublicMongooseWSRouter('media', Media, { apiTokenRequired: true }),
    //contact us:
    new PublicMongooseWSRouter('contact-us-forms', ContactUsForm, { apiTokenRequired: true }),
    //extras:
    new AppInfoSocketRouter(),
    new PublicMongooseWSRouter('pubg-teams', PubGTeam, { apiTokenRequired: true }),
];
const easySocket = new EasySocket({
    httpServer: express.http,
    originIsAllowed: (origin) => { return true; },
    onMessage: (socket, messageStr) =>
    {
        socket._send = socket.send;
        socket.send = (ms) =>
        {
            if (typeof ms != 'string')
                ms = JSON.stringify(ms);
            socket.sendUTF(ms);
        };
        if (messageStr.indexOf('{') != -1)
        {
            // console.log(messageStr);
            var msg = JSON.parse(messageStr);
            console.log(`Socket=>${msg.model}=>${msg.method}`);
            for (var i = 0; i < WSRouters.length; i++)
                WSRouters[i].onMessage(socket, msg);
        }
        else
            socket.send({ code: 400, error: "Access Denied" });
    },
    onSocketConnected: (connection) =>
    {
        console.log("onSocketConnected");
    },
    onSocketDisconnected: (connection, reasonCode, description) =>
    {
        console.log("onSocketDisconnected");
    },
});
