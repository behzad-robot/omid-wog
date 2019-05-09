import SiteRouter from "../site_router";
import { SITE_URL } from "../../constants";
import { isEmptyString, replaceAll } from "../../utils/utils";
const fs = require('fs');
const path = require('path');
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
                    fs.readFile('../storage/caches/dota2-top-champions.json', (err, data) =>
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
                                    fixBuilds(siteModules, topBuilds, champions).then((topBuilds) =>
                                    {
                                        fixBuilds(siteModules, latestBuilds, champions).then((latestBuilds) =>
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
                        fixBuilds(siteModules, builds, champions).then((builds) =>
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
    }
}
function fixBuilds(siteModules, builds, champions)
{
    return new Promise((resolve, reject) =>
    {
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