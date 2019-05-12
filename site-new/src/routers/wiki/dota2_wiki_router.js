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
            siteModules.Cache.getGame({ token: 'dota2' }).then((game) =>
            {
                siteModules.Champion.find({ gameId: game._id, limit: 20000 }).then((champions) =>
                {
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
                                { gameId: game._id },
                            ]
                        }).then((posts) =>
                        {
                            siteModules.Build.find({ gameId: game._id, sort: '-views', limit: 6 }).then((topBuilds) =>
                            {
                                siteModules.Build.find({ gameId: game._id, limit: 6 }).then((latestBuilds) =>
                                {
                                    fixBuilds(siteModules, topBuilds, champions, game).then((topBuilds) =>
                                    {
                                        fixBuilds(siteModules, latestBuilds, champions, game).then((latestBuilds) =>
                                        {
                                            this.renderTemplate(req, res, 'wiki-dota2/dota2-home.html', {
                                                game: game,
                                                champions, champions,
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
            siteModules.Cache.getGame({ token: 'dota2' }).then((game) =>
            {
                let query = {
                    limit: 20,
                    gameId: game._id,
                };
                if (req.query.champId)
                    query.champId = req.query.champId;
                siteModules.Build.find(query).then((builds) =>
                {
                    siteModules.Champion.find({ gameId: game._id, limit: 2000 }).then((champions) =>
                    {
                        fixBuilds(siteModules, builds, champions, game).then((builds) =>
                        {
                            this.renderTemplate(req, res, 'wiki-dota2/dota2-builds-archive.html', {
                                game: game,
                                builds: builds,
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
                    siteModules.Champion.getOne(build.champId).then((champion) =>
                    {
                        build._champion = champion;
                        siteModules.User.getOne(build.userId).then((user) =>
                        {
                            build._user = user;
                            siteModules.Build.find({ _ids: champion.topBuilds }).then((topBuilds) =>
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
                                                        this.renderTemplate(req, res, 'wiki-dota2/dota2-build-single.html', {
                                                            game: game,
                                                            build: build,
                                                            topBuilds: topBuilds,
                                                            otherBuilds: otherBuilds,
                                                            topChampions : topChampions,
                                                            comments : comments,
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
        this.router.get('/champions', (req, res) =>
        {
            siteModules.Cache.getGame({ token: 'dota2' }).then((game) =>
            {
                siteModules.Champion.find({ gameId: game._id, limit: 5000 }).then((champions) =>
                {
                    this.renderTemplate(req, res, 'wiki-dota2/dota2-champions-list.html', {
                        game: game,
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
                    hasUser = false;
                    break;
                }
            }
            if (!hasUser && !isEmptyString(builds[i].userId))
                requiredUsersIds.push(builds[i].userId);
            siteModules.User.find({ _ids: requiredUsersIds }).then((users) =>
            {
                for (var i = 0; i < builds.length; i++)
                {
                    //assign user:
                    for (var j = 0; j < users.length; j++)
                    {
                        if (builds[i].userId == users[j].userId)
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
        }
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