import MyExpressApp from "./libs/express";
import { log } from "./libs/log";
import { APICollection, APIProxy } from "./utils/api-helper";
import { API_TOKEN, ADMIN_TOKEN, GetMongoDBURL, SERVER_FILES_URL } from "./constants";
import SiteGeneralRouter from "./routers/general_router";
import { CacheReader } from "./utils/cache";
import SiteAuthRouter from "./routers/auth_router";
import SiteGamesRouter from "./routers/games_router";
import SitePostsRouter from "./routers/posts_router";
import SiteChampionsRouter from "./routers/champs_router";
import SiteBuildsRouter from "./routers/builds_router";
import SiteUsersRouter from "./routers/users_router";
import { isEmptyString } from "./utils/utils";


import { APISocket } from "./utils/api-socket";
//models:
import { Game } from "./utilsApi/game";
import { User } from "./utilsApi/user";
import { Champion } from "./utilsApi/champion";
import SiteContactRouter from "./routers/contact_router";
import { Post } from "./utilsApi/post";
import { PostCat } from "./utilsApi/postCat";
import { ChampBuild } from "./utilsApi/build";
import { ContactUsForm } from "./utilsApi/contactUsForm";
import { Media } from "./utilsApi/media";
import { Comment } from "./utilsApi/comment";
import { PubGTeam } from "./utilsApi/pubgteam";
import SiteCommentsRouter from "./routers/comments_router";
import PubGRouter from "./routers/pubg_router";
import { OTPObject } from "./utilsApi/otpobject";
import SiteOTPRouter from "./routers/otp_router";

const fs = require('fs');
const path = require('path');
// import AdminAnalyticsRouter from "./routers/admin_analytics";

//api socket
const apiSocket = new APISocket();
//express:
const express = new MyExpressApp({
    hasSessionEngine: true,
    mongoUrl: GetMongoDBURL(),
    serveFiles: ['public',
        {
            prefix: '/storage',
            path: '../storage',
        }
    ],
});
//modules:
const proxyAPI = new APIProxy({ apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const SiteModules = {
    User: new User(apiSocket),
    Game: new Game(apiSocket),
    Champion: new Champion(apiSocket),
    Build: new ChampBuild(apiSocket),
    Post: new Post(apiSocket),
    PostCat: new PostCat(apiSocket),
    Media: new Media(apiSocket),
    Comment: new Comment(apiSocket),
    ContactUsForm: new ContactUsForm(apiSocket),
    PubGTeam : new PubGTeam(apiSocket),
    OTPObject : new OTPObject(apiSocket),
    proxyAPI: proxyAPI,
    getConfig : ()=> {
        var config = JSON.parse(fs.readFileSync(path.resolve('config.json')).toString());
        return config;
    }
}
const allGamesCache = new CacheReader('all-games', (cb) =>
{
    SiteModules.Game.find().then((games) =>
    {
        console.log("find result is out!");
        cb(undefined, games);
    }).catch((err) =>
    {
        cb(err, undefined);
    });
});
const allPostsCatsCache = new CacheReader('allPostsCats', (cb) =>
{
    SiteModules.PostCat.find().then((cats) =>
    {
        cb(undefined, cats);
    }).catch((err) =>
    {
        cb(err, undefined);
    });
});
const navbarPostsCache = new CacheReader('navbar-posts', (cb) =>
{
    console.log("enter cache!");
    allPostsCatsCache.getData((err, cats) =>
    {
        if (err)
        {
            console.log("navbar-posts => " + err);
            cb(err, undefined);
            return;
        }
        const loadPosts = (index, done) =>
        {
            if (index >= cats.length)
            {
                done();
                return;
            }
            // console.log("loadPosts");
            var c = cats[index];
            SiteModules.Post.find({ categories: c._id }).then((posts) =>
            {
                c.posts = posts;
                loadPosts(index + 1, done);
            }).catch((err) =>
            {
                console.log("error while retriving result=>" + err.toString());
                loadPosts(index + 1, done);
            });
        };
        loadPosts(0, () =>
        {
            // console.log("navbarPostsCache:")
            // console.log(cats);
            // console.log("================================");
            cb(undefined, cats);
        });
    });
});
const footerPostsCache = new CacheReader('footer-posts', (cb) =>
{
    SiteModules.Post.find({ limit: 3 }).then((posts) =>
    {
        cb(undefined, posts);
    }).catch((err) =>
    {
        cb(err.toString(), undefined);
    });
});
const footerMediaCache = new CacheReader('footer-media', (cb) =>
{
    SiteModules.Media.find({ limit: 9 }).then((media) =>
    {
        cb(undefined, media);
    }).catch((err) =>
    {
        cb(err.toString(), undefined);
    });
});
const recommendedPostsCache = new CacheReader('posts-recommended', (cb) =>
{
    fs.readFile(path.resolve("../storage/caches/posts-recommended-ids.json"), (err, data) =>
    {
        console.log('recommendedPostsCache');
        if (err)
            cb(err, undefined);
        else
        {
            var ids = JSON.parse(data.toString());
            SiteModules.Post.find({ _ids: ids, _publicCast: true }).then((posts) =>
            {
                cb(undefined, posts);
            });
        }
    });
});
SiteModules.Cache = {
    //navbar , footer:
    allGames: allGamesCache,
    allPostsCats: allPostsCatsCache,
    navbarPosts: navbarPostsCache,
    footerPosts: footerPostsCache,
    footerMedia: footerMediaCache,
    //posts list , post single : 
    posts_recommended: recommendedPostsCache,

    getGame: (query, cb) =>
    {
        var key = Object.keys(query)[0];
        allGamesCache.getData((err, games) =>
        {
            if (err)
                cb(err, undefined);
            else
            {
                for (var i = 0; i < games.length; i++)
                {
                    var g = games[i];
                    if (g[key] == query[key])
                    {
                        cb(undefined, games[i]);
                        return;
                    }
                }
                cb("Not Found", undefined);
            }
        });
    },
    
}


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
    if (req.method != 'GET')
    {
        res.send({ code: 400, error: "Access Denied" });
        return;
    }
    if (req.query.cache)
    {
        if (req.query.cache == 'allGames')
        {
            SiteModules.Cache.allGames.getData((err, data) =>
            {
                if (err)
                    res.send(err.toString());
                else
                    res.send(data);
            });
            return;
        }
    }
    console.log('API CALL => ' + req.url);
    // if(req.url == 'twitch')
    // {
    //     res.send("Hello Twitch Mate You are doing this all wrong!")
    //     return;
    // }
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    fullUrl = fullUrl.replace('?cache=' + req.query.cache, '');
    fullUrl = fullUrl.replace("/api", ":8585/api");
    proxyAPI.apiCall(req.method, fullUrl, req.method == 'POST' ? req.body : {}).then((result) =>
    {
        res.send(result);
    }).catch((err) =>
    {
        res.send(err.toString());
    });
});
// express.expressApp.all('/storage/*', (req, res) =>
// {
//     console.log(req.url);
//     console.log(SERVER_FILES_URL+req.url);
//     res.writeHead(302, {
//         Location: SERVER_FILES_URL+req.url
//     });
//     res.end();
// });
//routers:
express.expressApp.use('/', new SiteGeneralRouter(SiteModules).router);
express.expressApp.use('/', new SiteContactRouter(SiteModules).router);
express.expressApp.use('/', new SiteAuthRouter(SiteModules).router);

express.expressApp.use('/users', new SiteUsersRouter(SiteModules).router);
express.expressApp.use('/games', new SiteGamesRouter(SiteModules).router);
express.expressApp.use('/champions', new SiteChampionsRouter(SiteModules).router);
express.expressApp.use('/posts', new SitePostsRouter(SiteModules).router);
express.expressApp.use('/comments', new SiteCommentsRouter(SiteModules).router);
express.expressApp.use('/builds', new SiteBuildsRouter(SiteModules).router);
express.expressApp.use('/pubg-tournament', new PubGRouter(SiteModules).router);


// express.expressApp.use('/', new AdminAnalyticsRouter(AnalyticsEvent).router)
apiSocket.connect(() =>
{
    log.success("api socket connected.");
    //listen:
    const PORT = 80;
    express.http.listen(PORT, function ()
    {
        log.success('http server listening on port ' + PORT);
    });
});
