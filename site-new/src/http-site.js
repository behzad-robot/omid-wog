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

const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
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
    PubGTeam: new PubGTeam(apiSocket),
    getConfig: () =>
    {
        var config = JSON.parse(fs.readFileSync(path.resolve('config.json')).toString());
        return config;
    }
}
//caches:
const allGamesCache = new CacheReader('games-all', (cb) =>
{
    console.log('updating games-all cache');
    SiteModules.Game.find().then((games) =>
    {
        cb(undefined, games);
    }).catch((err) =>
    {
        cb(err, undefined);
    });
});
const allPostsCatsCache = new CacheReader('posts-cats-all', (cb) =>
{
    console.log('updating posts-cats-all cache');
    SiteModules.PostCat.find().then((cats) =>
    {
        cb(undefined, cats);
    }).catch((err) =>
    {
        cb(err, undefined);
    });
});
const navbarNewsCache = new CacheReader('navbar-news', (cb) =>
{
    console.log('updating navbar-news cache');
    allPostsCatsCache.getData((err, cats) =>
    {
        if (err)
            cb(err, undefined);
        else
        {
            var results = [];
            //first find news category and its children:
            for (var i = 0; i < cats.length; i++)
            {
                if (cats[i].slug == 'news')
                {
                    results.push(cats[i]);
                    break;
                }
            }
            for (var i = 0; i < cats.length; i++)
            {
                if (cats[i].parent == results[0]._id)
                {
                    results.push(cats[i]);
                }
            }
            const loadPosts = (index, done) =>
            {
                if (index >= results.length)
                {
                    done();
                    return;
                }
                // console.log("loadPosts");
                var c = results[index];
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
                cb(undefined, results);
            });
        }
    });
});
const navbarArticlesCache = new CacheReader('navbar-articles', (cb) =>
{
    console.log('updating navbar-articles cache');
    allPostsCatsCache.getData((err, cats) =>
    {
        if (err)
            cb(err, undefined);
        else
        {
            var results = [];
            //first find news category and its children:
            for (var i = 0; i < cats.length; i++)
            {
                if (cats[i].slug == 'articles')
                {
                    results.push(cats[i]);
                    break;
                }
            }
            for (var i = 0; i < cats.length; i++)
            {
                if (cats[i].parent == results[0]._id)
                {
                    results.push(cats[i]);
                }
            }
            const loadPosts = (index, done) =>
            {
                if (index >= results.length)
                {
                    done();
                    return;
                }
                // console.log("loadPosts");
                var c = results[index];
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
                cb(undefined, results);
            });
        }
    });
});
SiteModules.Cache = {
    //game related:
    allGames: allGamesCache,
    getGame: function (query)
    {
        return new Promise((resolve, reject) =>
        {
            var key = Object.keys(query)[0];
            allGamesCache.getData((err, games) =>
            {
                if (err)
                    reject(err);
                else
                {
                    for (var i = 0; i < games.length; i++)
                    {
                        var g = games[i];
                        if (g[key] == query[key])
                        {
                            resolve(g);
                            return;
                        }
                    }
                    reject("Not found");
                }
            });
        });
    },
    //navbar:
    allPostsCats: allPostsCatsCache,
    navbarNews: navbarNewsCache,
    navbarTutorials: navbarArticlesCache,
};





//add general middlewares here:
express.expressApp.disable('etag'); //fully disable cache!
express.expressApp.use(morgan('tiny'))

//routers:
express.expressApp.use('/pubg-tournament', new PubGRouter(SiteModules).router);
express.expressApp.use('/', new SiteGeneralRouter(SiteModules).router);
// express.expressApp.use('/', new SiteContactRouter(SiteModules).router);
// express.expressApp.use('/', new SiteAuthRouter(SiteModules).router);
// express.expressApp.use('/users', new SiteUsersRouter(SiteModules).router);
// express.expressApp.use('/games', new SiteGamesRouter(SiteModules).router);
// express.expressApp.use('/champions', new SiteChampionsRouter(SiteModules).router);
// express.expressApp.use('/posts', new SitePostsRouter(SiteModules).router);
// express.expressApp.use('/comments', new SiteCommentsRouter(SiteModules).router);
// express.expressApp.use('/builds', new SiteBuildsRouter(SiteModules).router);


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