import SiteRouter from "./site_router";
import { isEmptyString } from '../utils/utils';
const fs = require('fs');
const path = require('path');

export default class SiteGeneralRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.get('/home', (req, res) =>
        {
            res.redirect('/');
        });
        this.router.get('/163110.txt', (req, res) =>
        {
            res.send('');
        });
        this.router.get('/', (req, res) =>
        {
            let fail = (err) =>
            {
                this.show500(req, res, err);
            }
            loadPosts(siteModules, { limit: 16 }).then((latestPosts) =>
            {
                fs.readFile(path.resolve('../storage/caches/posts-grid.json'), (err, gridFile) =>
                {
                    if (err)
                    {
                        fail(err);
                        return;
                    }
                    var gridIds = JSON.parse(gridFile.toString());
                    loadPosts(siteModules, { _ids: gridIds }).then((gridPosts) =>
                    {
                        fs.readFile(path.resolve('../storage/aparat/posts-archive-aparat.json'), (err, aparatFile) =>
                        {
                            if (err)
                            {
                                fail(err);
                                return;
                            }
                            var aparatVideosFull = JSON.parse(aparatFile.toString());
                            var aparatVideos = [];
                            for (var i = 0; i < aparatVideosFull.length; i++)
                                aparatVideos.push(aparatVideosFull[i]);
                            fs.readFile(path.resolve('../storage/caches/upcoming-games.json'), (err, upComingGamesFile) =>
                            {
                                if (err)
                                {
                                    fail(err);
                                    return;
                                }
                                var upComingGames = JSON.parse(upComingGamesFile.toString());
                                siteModules.Cache.usersCount.getData((err, usersCount) =>
                                {
                                    this.renderTemplate(req, res, 'wog-home.html', {
                                        latestPosts: latestPosts,
                                        aparatVideos: aparatVideos,
                                        upComingGames: upComingGames,
                                        gridPosts0: gridPosts[0],
                                        gridPosts1: gridPosts[1],
                                        gridPosts2: gridPosts[2],
                                        gridPosts3: gridPosts[3],
                                        gridPosts4: gridPosts[4],
                                        usersCount: usersCount,
                                    });
                                });
                            });
                        });
                    }).catch(fail);
                });
            }).catch(fail);
        });
        this.router.get('/html/:fileName', (req, res) =>
        {
            this.renderTemplate(req, res, req.params.fileName + '.html', {});
        });
        this.router.get('/shop', (req, res) =>
        {
            this.renderTemplate(req, res, 'coming-soon.html', {});
        });
        this.router.get('/about-us', (req, res) =>
        {
            this.renderTemplate(req, res, 'about-us.html', {});
        });
        this.router.get('/landing-page', (req, res) =>
        {
            this.renderTemplate(req, res, 'ad-landing-page.html', {});
        });

        // this.router.get('/sms', (req, res) =>
        // {
        //     kavenegarAPI.Send({ message: "من یک تباهم آرزو دارم 3530" , sender: "100065995" , receptor: "09375801307" });
        //     res.send('TABAH!');
        // });
    }
}
function loadPosts(siteModules, params)
{
    return new Promise((resolve, reject) =>
    {
        siteModules.Post.find(params).then((posts) =>
        {
            let requiredUsersIds = [];
            for (var i = 0; i < posts.length; i++)
            {
                let has = false;
                for (var j = 0; j < requiredUsersIds.length; j++)
                {
                    if (requiredUsersIds[j] == posts[i].authorId)
                    {
                        has = true;
                        break;
                    }
                }
                if (!has && !isEmptyString(posts[i].authorId))
                    requiredUsersIds.push(posts[i].authorId);
            }
            siteModules.User.find({ _ids: requiredUsersIds }).then((users) =>
            {
                for (var i = 0; i < posts.length; i++)
                {
                    for (var j = 0; j < users.length; j++)
                    {
                        if (posts[i].authorId == users[j]._id)
                        {
                            posts[i]._author = users[j];
                            break;
                        }
                    }
                }
                resolve(posts);
            }).catch(reject);
        }).catch(reject);
    });
}