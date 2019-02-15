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
// import AdminAnalyticsRouter from "./routers/admin_analytics";

//db:
const User = new APICollection('users', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Game = new APICollection('games', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Post = new APICollection('posts', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const PostCat = new APICollection('posts-cats', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Admin = new APICollection('admins', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Champion = new APICollection('champions', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const ChampBuild = new APICollection('builds', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const ContactUsForm = new APICollection('contact-us-forms', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });

const ICON_404 = '/images/404-image.png';
Champion.fixOne = (champ) =>
{
    if (isEmptyString(champ.icon))
        champ.icon = ICON_404;
    if (isEmptyString(champ.icon_gif))
        champ.icon_gif = champ.icon_tall;
    champ.siteUrl = '/champions/' + champ.slug;
    champ.roles_str = '';
    for (var i = 0; i < champ.roles.length; i++)
        champ.roles_str += champ.roles[i].name + ' , ';
    champ.roles_str = champ.roles_str.substring(0, champ.roles_str.length - 1);
    return champ;
};
Champion.fixAll = (champions) =>
{
    for (var i = 0; i < champions.length; i++)
    {
        champions[i] = Champion.fixOne(champions[i]);
    }
    return champions;
};
Game.fixOne = (game) =>
{
    for (var i = 0; i < game.items.length; i++)
    {
        if (game.items[i].name == 'NECRONOMICON 2')
            console.log('ICON=>' + game.items[i].icon + '=>' + isEmptyString(game.items[i].icon));
        if (isEmptyString(game.items[i].icon))
            game.items[i].icon = ICON_404;
    }
    return game;
};
Game.fixAll = (games) =>
{
    for (var i = 0; i < games.length; i++)
        games[i] = Game.fixOne(games[i]);
    return games;
}
ChampBuild.fixOne = (build) =>
{

};
Post.fixOne = (p) =>
{
    if (isEmptyString(p.media))
        p.media = ICON_404;
    p.siteUrl = '/posts/' + p.slug;
    return p;
};
Post.fixAll = (ps) =>
{
    for (var i = 0; i < ps.length; i++)
        ps[i] = Post.fixOne(ps[i]);
    return ps;
};
User.checkToken = (token) =>
{
    return new Promise((resolve, reject) =>
    {
        User.apiCall('/check-token', 'POST', { token: token }).then(resolve).catch(reject);
    });
};
User.fixOne = (user) =>
{
    if (isEmptyString(user.profileImage))
        user.profileImage = '/images/user-profile-default.png';
    if (isEmptyString(user.cover))
        user.cover = '/images/poro-pool.jpg';
    if (isEmptyString(user.aboutMe))
        user.aboutMe = 'وارد نشده.';
    return user;
};
User.public = (doc) =>
{
    doc = User.fixOne(doc);
    delete (doc.token);
    delete (doc.password);
    delete (doc.email);
    delete (doc.phoneNumber);
    return doc;
}
//modules:
const proxyAPI = new APIProxy({ apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const allGamesCache = new CacheReader('all-games', (cb) =>
{
    Game.find().then((games) =>
    {
        cb(undefined, games);
    }).catch((err) =>
    {
        cb(err, undefined);
    });
});
const allPostsCatsCache = new CacheReader('allPostsCats', (cb) =>
{
    PostCat.find().then((cats) =>
    {
        cb(undefined, cats);
    }).catch((err) =>
    {
        cb(err, undefined);
    });
});
const allDota2Champions = new CacheReader('allDota2Champions', (cb) =>
{
    Champion.find({ gameId: '5c483dc1c966fb21f9ae800c' }).then((data) =>
    {
        cb(undefined, data);
    }).catch((err) =>
    {
        cb(err, undefined);
    });
});
const SiteModules = {
    User: User,
    Game: Game,
    Champion: Champion,
    Admin: Admin,
    Build: ChampBuild,
    Post: Post,
    PostCat: PostCat,
    ContactUsForm: ContactUsForm,
    proxyAPI: proxyAPI,
    Cache: {
        allGames: allGamesCache,
        allPostsCatsCache: allPostsCatsCache,
        allDota2Champions: allDota2Champions,
    }
}
//express:
const express = new MyExpressApp({
    hasSessionEngine: true,
    mongoUrl: GetMongoDBURL(),
    serveFiles: ['public', /*{
        prefix: '/storage',
        path: '../storage',
    }*/],
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
// express.expressApp.disable('etag'); //fully disable cache!
//proxy for api:
express.expressApp.all('/api/*', (req, res) =>
{
    // res.send('SHINE');    
    // if (req.method != 'GET') {
    //     res.send('access denied!');
    //     return;
    // }
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
        // if (req.query.cache == 'allPostsCats')
        // {
        //     console.log(`using cache for ${req.query.cache}`);
        //     SiteModules.Cache.allPostsCatsCache.getData((err, data) =>
        //     {
        //         if (err)
        //             res.send(err.toString());
        //         else
        //             res.send(data);
        //     });
        // }

    }
    if (req.url.indexOf('/champions') != -1 && req.query.gameId == '5c483dc1c966fb21f9ae800c')
    {
        console.log(`using cache for allDota2Champions`);
        SiteModules.Cache.allDota2Champions.getData((err, data) =>
        {
            if (err)
                res.send(err.toString());
            else
                res.send(data);
        });
        return;
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
express.expressApp.all('/storage/*', (req, res) =>
{
    console.log(req.url);
    console.log(SERVER_FILES_URL+req.url);
    res.writeHead(302, {
        Location: SERVER_FILES_URL+req.url
    });
    res.end();
});
//routers:
express.expressApp.use('/', new SiteGeneralRouter(SiteModules).router);
express.expressApp.use('/', new SiteAuthRouter(SiteModules).router);
express.expressApp.use('/users', new SiteUsersRouter(SiteModules).router);
express.expressApp.use('/games', new SiteGamesRouter(SiteModules).router);
express.expressApp.use('/champions', new SiteChampionsRouter(SiteModules).router);
express.expressApp.use('/posts', new SitePostsRouter(SiteModules).router);
express.expressApp.use('/posts', new SitePostsRouter(SiteModules).router);
express.expressApp.use('/builds', new SiteBuildsRouter(SiteModules).router);

// express.expressApp.use('/', new AdminAnalyticsRouter(AnalyticsEvent).router)
//listen:
const PORT = 80;
express.http.listen(PORT, function ()
{
    log.success('http server listening on port ' + PORT);
});