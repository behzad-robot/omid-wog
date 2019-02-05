
import { log } from './libs/log';
import MyExpressApp from './libs/express';

import { User } from './models/user';
import { Game } from './models/game';
import { AnalyticsEvent } from './models/analytics';
import MongooseDB from './libs/mongoose-db';


import UsersAuthRouter from './routers/users_auth_router';
import { PublicMongooseAPIRouter } from './routers/public-api-mongoose';
import { AppInfoRouter } from './routers/app_info_router';
import { IS_LOCALHOST, GetMongoDBURL, ADMIN_TOKEN, API_TOKEN } from './constants';
import { Admin } from './models/admin';
import AdminsAuthRouter from './routers/admins_auth_router';
import { Post } from './models/post';
import { FileUploaderRouter } from './routers/file_uploader_router';
import { Champion } from './models/champion';
import { ChampionBuild } from './models/champBuild';
import { ContactUsForm } from './models/contactUsForm';



const express = new MyExpressApp({
    hasSessionEngine : false,
    mongoUrl: GetMongoDBURL(),
    serveFiles : '../storage'
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
express.expressApp.use((req, res, next) =>
{
    const end = res.end;
    res.end = (chunk, encoding) =>
    {
        AnalyticsEvent.Helpers.newHttpEvent(req.originalUrl, "http-api", {
            method: req.method,
            headers: req.headers,
            query: req.query,
            body: req.method,
            ip: req.ip,
        }, {
                statusCode: res.statusCode,
            }, res.statusCode).then(() =>
            {
                //super:
                res.end = end;
                res.end(chunk, encoding);
            }).catch((err) =>
            {
                //super:
                res.end = end;
                res.end(chunk, encoding);
            });
        //console.log('Date.now=' + Date.now());
    };
    next();
});
//add routers here:
express.expressApp.get('/', (req, res) =>
{
    res.status(200).send('Welcome to API :)');
});
express.expressApp.use('/api/', new AppInfoRouter().router);
express.expressApp.use('/api/analytics/', new PublicMongooseAPIRouter(AnalyticsEvent, { apiTokenRequired: true }).router);
//admins:
express.expressApp.use('/api/admins/', new PublicMongooseAPIRouter(Admin, { apiTokenRequired: true }).router);
express.expressApp.use('/api/admins/', new AdminsAuthRouter(Admin).router);
//users:
express.expressApp.use('/api/users/', new UsersAuthRouter(User).router);
express.expressApp.use('/api/users/', new PublicMongooseAPIRouter(User, { apiTokenRequired: true }).router);
//games:
express.expressApp.use('/api/games/', new PublicMongooseAPIRouter(Game, { apiTokenRequired: true }).router);
//champions , champBuilds:
express.expressApp.use('/api/champions/', new PublicMongooseAPIRouter(Champion, { apiTokenRequired: true }).router);
express.expressApp.use('/api/builds/', new PublicMongooseAPIRouter(ChampionBuild, { apiTokenRequired: true }).router);
//posts & news:
express.expressApp.use('/api/posts/', new PublicMongooseAPIRouter(Post, { apiTokenRequired: true }).router);
//contact us:
express.expressApp.use('/api/contact-us-forms/', new PublicMongooseAPIRouter(ContactUsForm, { apiTokenRequired: true }).router);
//file upload:
// express.expressApp.use('/api/', new FileUploaderRouter().router);
//listen:
const PORT = 8585;
express.http.listen(PORT, function ()
{
    log.success('http server listening on port ' + PORT);
});