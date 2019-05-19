import SiteRouter from "../site_router";
import { SITE_URL } from "../../constants";
import { isEmptyString, replaceAll } from "../../utils/utils";
const fs = require('fs');
const path = require('path');
const TOP_CHAMPS_PATH = path.resolve('../storage/caches/dota2-top-champions.json');
export class Dota2WikiRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.get('/', (req, res) =>
        {
            //home
            siteModules.Cache.getGame({ token: 'dota2' }).then((game) =>
            {
                siteModules.Champion.find({ gameId: game._id, limit: 20000 }).then((champions) =>
                {
                    let strengthChampions = [], agilityChampions = [], intelligenceChampions = [];
                    for (var i = 0; i < champions.length; i++)
                    {
                        let c = champions[i];
                        if (c.primaryAttr == 'Strength')
                            strengthChampions.push(c);
                        else if (c.primaryAttr == 'Agility')
                            agilityChampions.push(c);
                        else if (c.primaryAttr == 'Intelligence')
                            intelligenceChampions.push(c);
                    }
                    fs.readFile(TOP_CHAMPS_PATH, (err, data) =>
                    {
                        if (err)
                        {
                            this.show500(req, res, err);
                            return;
                        }
                        let topChampionsIds = JSON.parse(data.toString());
                        let topChampions = [];
                        for (var i = 0; i < topChampionsIds.length; i++)
                        {
                            for (var j = 0; j < champions.length; j++)
                            {
                                if (topChampionsIds[i] == champions[j]._id)
                                {
                                    topChampions.push(champions[j]);
                                    break;
                                }
                            }
                        }
                        siteModules.Post.find({
                            '$or': [
                                { tags: 'dota2' },
                                { tags: 'Dota 2' },
                                { gameId: game._id },
                            ],
                            limit: 4,
                        }).then((posts) =>
                        {
                            siteModules.Build.find({ gameId: game._id, sort: '-views', limit: 4 }).then((topBuilds) =>
                            {
                                siteModules.Build.find({ gameId: game._id, limit: 4 }).then((latestBuilds) =>
                                {
                                    fixBuilds(siteModules, topBuilds, champions, game).then((topBuilds) =>
                                    {
                                        fixBuilds(siteModules, latestBuilds, champions, game).then((latestBuilds) =>
                                        {
                                            this.renderTemplate(req, res, 'wiki-dota2/dota2-home.html', {
                                                game: game,
                                                champions, champions,
                                                strengthChampions: strengthChampions,
                                                intelligenceChampions: intelligenceChampions,
                                                agilityChampions: agilityChampions,
                                                topChampions: topChampions,
                                                topBuilds: topBuilds,
                                                latestBuilds: latestBuilds,
                                                posts: posts,
                                                //streamers are loaded in page :))
                                            });
                                        }).catch((err) =>
                                        {
                                            this.show500(req, res, err);
                                        });
                                    }).catch((err) =>
                                    {
                                        this.show500(req, res, err);
                                    })
                                });
                            }).catch((err) =>
                            {
                                this.show500(req, res, err);
                            });

                        }).catch((err) =>
                        {
                            this.show500(req, res, err);
                        });

                    });
                });
            }).catch((err) =>
            {
                this.show500(req, res, err);
            })
        });
        this.router.get('/builds', (req, res) =>
        {
            //builds archive
            siteModules.Cache.getGame({ token: 'dota2' }).then((game) =>
            {
                let renderBuildsArchive = (query, title, loadMoreStr) =>
                {
                    siteModules.Build.find(query).then((builds) =>
                    {
                        siteModules.Champion.find({ gameId: game._id, limit: 2000 }).then((champions) =>
                        {
                            fixBuilds(siteModules, builds, champions, game).then((builds) =>
                            {
                                this.renderTemplate(req, res, 'wiki-dota2/dota2-builds-archive.html', {
                                    title: title,
                                    game: game,
                                    builds: builds,
                                    loadMoreStr: loadMoreStr,
                                });
                            });
                        }).catch((err) =>
                        {
                            this.show500(req, res, err);
                        });

                    }).catch((err) =>
                    {
                        this.show500(req, res, err);
                    });
                };
                let query = {
                    limit: 50,
                    gameId: game._id,
                };
                if (req.query.champId)
                {
                    query.champId = req.query.champId;
                    siteModules.Champion.getOne(req.query.champId).then((c) =>
                    {
                        renderBuildsArchive(query, c.name, '?champId=' + req.query.champId);
                    });
                }
                else if (req.query.filter)
                {
                    if (req.query.filter == 'top')
                    {
                        query.sort = '-views';
                        renderBuildsArchive(query, 'پربازدیدترین آموزش ها', '?sort=-views');
                    }
                    else
                        this.show404(req, res);
                }
                else
                {
                    renderBuildsArchive(query, 'تازه های آموزش ها', '?none=true');
                }
            });
        });
        this.router.get('/builds/load-more', (req, res) =>
        {
            delete (req.query.none);
            let fail = (err) =>
            {
                res.send({ code: 500, error: err });
            }
            siteModules.Cache.getGame({ token: 'dota2' }).then((game) =>
            {
                let query = req.query;
                query.offset = parseInt(req.query.offset ? req.query.offset : 0);
                query.limit = parseInt(req.query.limit ? req.query.limit : 50);
                query.gameId = game._id;
                siteModules.Build.find(query).then((builds) =>
                {
                    siteModules.Champion.find({ gameId: game._id, limit: 2000 }).then((champions) =>
                    {
                        fixBuilds(siteModules, builds, champions, game).then((builds) =>
                        {
                            res.send({ code: 200, error: undefined, _data: builds });
                        });
                    }).catch(fail);
                }).catch(fail);
            }).catch(fail);
        });
        this.router.get('/builds/:_id', (req, res) =>
        {
            let fail = (err) =>
            {
                this.show500(req, res, err);
            };
            siteModules.Cache.getGame({ token: 'dota2' }).then((game) =>
            {
                siteModules.Build.getOne(req.params._id).then((build) =>
                {
                    //fix if user has voted for this build:
                    build._currentUserHasUpVoted = false;
                    build._currentUserHasDownVoted = false;
                    if (this.isLoggedIn(req))
                    {
                        for (var i = 0; i < build.upVotes.length; i++)
                        {
                            if (build.upVotes[i] == req.session.currentUser._id)
                            {
                                build._currentUserHasUpVoted = true;
                                break;
                            }
                        }
                        for (var i = 0; i < build.downVotes.length; i++)
                        {
                            if (build.downVotes[i] == req.session.currentUser._id)
                            {
                                build._currentUserHasDownVoted = true;
                                break;
                            }
                        }

                    }
                    //fix the build for _items:
                    build._itemRows = [];
                    for (var i = 0; i < build.itemRows.length; i++)
                    {
                        build._itemRows.push({
                            _index: i,
                            title: build.itemRows[i].title,
                            notes: build.itemRows[i].notes,
                            items: [],
                        });
                        var row = build.itemRows[i];
                        for (var j = 0; j < row.items.length; j++)
                        {
                            for (var k = 0; k < game.items.length; k++)
                            {
                                if (game.items[k]._id == row.items[j])
                                {
                                    build._itemRows[i].items.push(game.items[k]);
                                    build._itemRows[i].items[j]._index = j;
                                    break;
                                }
                            }
                        }
                    }
                    siteModules.Champion.getOne(build.champId).then((champion) =>
                    {
                        //fix the build _abilities:
                        build._abilities = [];
                        for (var i = 0; i < champion.abilities.length; i++)
                        {
                            if (isEmptyString(champion.abilities[i].btn))
                                continue;
                            let a = champion.abilities[i];
                            build._abilities.push(a);
                            a.levels = [];
                            for (var j = 0; j < 18; j++)
                            {
                                a.levels.push({
                                    level: j + 1,
                                    isLevel: (build.abilities[j] == a.btn),
                                });
                            }
                        }
                        //fix the build _talents:
                        build._talents = [];
                        for (var i = 0; i < champion.talents.length; i++)
                        {
                            let t = champion.talents[i];
                            build._talents.push(t);
                            t.isA = build.talents[i].pick == 'a';
                            t.isB = build.talents[i].pick == 'b';
                        }
                        build._champion = champion;
                        siteModules.User.getOne(build.userId).then((user) =>
                        {
                            build._user = user;
                            siteModules.Build.find({ champId: champion._id, sort: '-views' }).then((topBuilds) =>
                            {
                                fixBuilds(siteModules, topBuilds, [champion], game).then((topBuilds) =>
                                {
                                    siteModules.Build.find({ champId: champion._id, limit: 6 }).then((otherBuilds) =>
                                    {
                                        fixBuilds(siteModules, otherBuilds, [champion], game).then((otherBuilds) =>
                                        {
                                            loadTopChampions(siteModules).then((topChampions) =>
                                            {
                                                siteModules.Comment.find({ objectType: 'builds', objectId: build._id }).then((comments) =>
                                                {
                                                    fixComments(siteModules, comments).then((comments) =>
                                                    {
                                                        //check if we want to increase views count too or not:
                                                        if (req.session.pageViews == undefined)
                                                            req.session.pageViews = [];
                                                        if (this.isFirstPageView(req))
                                                        {
                                                            build.views++;
                                                            siteModules.Build.apiCall('increase-view', { _id: build._id }).then((result) =>
                                                            {
                                                                console.log(`increased build ${result._id} views => ${result.views}`);
                                                            }).catch((err) =>
                                                            {
                                                                console.log('failed to increase views for build=>' + err.toString());
                                                            });
                                                        }
                                                        this.viewPage(req);
                                                        //render page:
                                                        this.renderTemplate(req, res, 'wiki-dota2/dota2-build-single.html', {
                                                            game: game,
                                                            build: build,
                                                            topBuilds: topBuilds,
                                                            otherBuilds: otherBuilds,
                                                            topChampions: topChampions,
                                                            comments: comments,
                                                        });
                                                    }).catch(fail);
                                                });
                                            }).catch(fail);
                                        });
                                    }).catch(fail);
                                }).catch(fail);
                            }).catch(fail);
                        }).catch(fail);
                    }).catch(fail);
                }).catch(fail);
            }).catch(fail);
        });
        this.router.post('/builds/:_id/vote', (req, res) =>
        {
            if (isEmptyString(req.body.userId))
            {
                res.send({ code: 500, error: 'missing user id' });
                return;
            }
            siteModules.User.find({ _id: req.body.userId }).then((users) =>
            {
                if (users == null || users.length == 0)
                {
                    res.send({ code: 500, error: 'invalid user id' });
                    return;
                }
                let user = users[0];
                console.log('user.token is =' + user.token);
                console.log('req.body.token is =' + req.body.token);
                if (user.token != req.body.token)
                {
                    res.send({ code: 400, error: 'invalid token' });
                    return;
                }
                //req.body.vote => up / down
                siteModules.Build.apiCall('vote', { buildId: req.params._id, vote: req.body.vote, userId: req.body.userId }).then((build) =>
                {
                    res.send({ code: 200, error: undefined, build: build });
                }).catch((err) =>
                {
                    res.send({ code: 500, error: err.toString() });
                });
            });
        });
        this.router.get('/champions', (req, res) =>
        {
            //champions-list champions-archive
            siteModules.Cache.getGame({ token: 'dota2' }).then((game) =>
            {
                siteModules.Champion.find({ gameId: game._id, limit: 5000 }).then((champions) =>
                {
                    let strengthChampions = [], agilityChampions = [], intelligenceChampions = [];
                    for (var i = 0; i < champions.length; i++)
                    {
                        let c = champions[i];
                        if (c.primaryAttr == 'Strength')
                            strengthChampions.push(c);
                        else if (c.primaryAttr == 'Agility')
                            agilityChampions.push(c);
                        else if (c.primaryAttr == 'Intelligence')
                            intelligenceChampions.push(c);
                    }
                    console.log(`champions count=${champions.length}`);
                    console.log(`strengthChampions count=${champions.length}`);
                    console.log(`agilityChampions count=${champions.length}`);
                    console.log(`intelligenceChampions count=${champions.length}`);
                    this.renderTemplate(req, res, 'wiki-dota2/dota2-champions-list.html', {
                        game: game,
                        strengthChampions: strengthChampions,
                        agilityChampions: agilityChampions,
                        intelligenceChampions: intelligenceChampions,
                        champions: champions,
                    });
                }).catch((err) =>
                {
                    this.show500(req, res, err);
                });
            }).catch((err) =>
            {
                this.show500(req, res, err);
            });
        });
        this.router.get('/champions/:slug', (req, res) =>
        {
            //champion-single champ-single
            siteModules.Cache.getGame({ token: 'dota2' }).then((game) =>
            {
                console.log(req.params.slug);
                siteModules.Champion.findOne({ slug: req.params.slug }).then((champion) =>
                {
                    siteModules.Build.find({ champId: champion._id, limit: 10 }).then((builds) =>
                    {
                        fixBuilds(siteModules, builds, [champion], game).then((builds) =>
                        {
                            siteModules.Build.find({ _ids: champion.topBuilds }).then((topBuilds) =>
                            {
                                fixBuilds(siteModules, topBuilds, [champion], game).then((topBuilds) =>
                                {
                                    siteModules.Media.find({
                                        '$or': [
                                            { champId: champion._id },
                                            { tags: champion.slug }
                                        ], limit: 12
                                    }).then((media) =>
                                    {
                                        champion._stats = {};
                                        for (var i = 0; i < champion.stats.length; i++)
                                        {
                                            champion._stats[champion.stats[i].name] = champion.stats[i].value;
                                        }
                                        this.renderTemplate(req, res, 'wiki-dota2/dota2-champion-single.html', {
                                            game: game,
                                            champion: champion,
                                            builds: builds,
                                            topBuilds, topBuilds,
                                            media: media,
                                        });
                                    }).catch((err) =>
                                    {
                                        this.show500(req, res, err);
                                    });
                                }).catch((err) =>
                                {
                                    this.show500(req, res, err);
                                });
                            }).catch((err) =>
                            {
                                this.show500(req, res, err);
                            });
                        }).catch((err) =>
                        {
                            this.show500(req, res, err);
                        });
                    });

                }).catch((err) =>
                {
                    this.show500(req, res, err);
                });
            }).catch((err) =>
            {
                this.show500(req, res, err);
            });
        });
    }
}
function fixBuilds(siteModules, builds, champions, game)
{
    return new Promise((resolve, reject) =>
    {
        if (builds.length == 0)
        {
            resolve(builds);
            return;
        }
        let requiredUsersIds = [];
        for (var i = 0; i < builds.length; i++)
        {
            let hasUser = false;
            for (var j = 0; j < requiredUsersIds.length; j++)
            {
                if (requiredUsersIds[j] == builds[i].userId)
                {
                    hasUser = true;
                    break;
                }
            }
            if (!hasUser && !isEmptyString(builds[i].userId))
                requiredUsersIds.push(builds[i].userId);
        }
        siteModules.User.find({ _ids: requiredUsersIds }).then((users) =>
        {
            for (var i = 0; i < builds.length; i++)
            {
                //assign user:
                for (var j = 0; j < users.length; j++)
                {
                    if (builds[i].userId == users[j]._id)
                    {
                        builds[i]._user = users[j];
                        break;
                    }
                }
                //assign champion:
                for (var j = 0; j < champions.length; j++)
                {
                    if (builds[i].champId == champions[j]._id)
                    {
                        builds[i]._champion = champions[j];
                        break;
                    }
                }
            }
            resolve(builds);
        }).catch(reject);
    });
}
function loadTopChampions(siteModules)
{
    return new Promise((resolve, reject) =>
    {
        fs.readFile(TOP_CHAMPS_PATH, (err, data) =>
        {
            if (err)
            {
                reject(err);
                return;
            }
            let topChampionsIds = JSON.parse(data.toString());
            siteModules.Champion.find({ _ids: topChampionsIds }).then(resolve).catch(reject);
        });
    });
}
function fixComments(siteModules, comments)
{
    return new Promise((resolve, reject) =>
    {
        if (comments.length == 0)
            resolve(comments);
        let requiredUsersIds = [];
        for (var i = 0; i < comments.length; i++)
        {
            let hasUser = false;
            for (var j = 0; j < requiredUsersIds.length; j++)
            {
                if (comments[i].userId == requiredUsersIds[j])
                {
                    hasUser = true;
                    break;
                }
            }
            if (!isEmptyString(comments[i].userId) && !hasUser)
                requiredUsersIds.push(comments[i].userId);
        }
        siteModules.User.find({ _ids: requiredUsersIds }).then((users) =>
        {
            for (var i = 0; i < comments.length; i++)
            {
                for (var j = 0; j < users.length; j++)
                {
                    if (comments[i].userId == users[j]._id)
                    {
                        comments[i]._user = users[j];
                        break;
                    }
                }
            }
            resolve(comments);
        }).catch(reject);
    });
}