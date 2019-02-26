import SiteRouter from "./site_router";
import { isEmptyString } from '../utils/utils';
export default class SiteChampionsRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.get('/:champSlug', (req, res) =>
        {
            siteModules.Champion.find({ slug: req.params.champSlug }).then((champions) =>
            {
                if (champions.length == 0)
                    this.show404(req, res);
                else
                {
                    let champion = champions[0];
                    siteModules.Cache.allGames.getData((err, games) =>
                    {
                        if (err)
                        {
                            this.show500(req, res, err.toString());
                            return;
                        }
                        let game = undefined;
                        for (var i = 0; i < games.length; i++)
                        {
                            if (games[i]._id == champion.gameId)
                            {
                                game = games[i];
                                break;
                            }
                        }
                        if (game == undefined)
                        {
                            this.show500(req, res, "Game Not Found");
                            return;
                        }
                        //find builds:
                        siteModules.Build.find({ champId: champion._id }).then((builds) =>
                        {
                            var buildsUsers = [];
                            for (var i = 0; i < builds.length; i++)
                            {
                                var has = false;
                                for (var j = 0; j < buildsUsers.length; j++)
                                {
                                    if (builds[i].userId == buildsUsers[j])
                                    {
                                        has = true;
                                        break;
                                    }
                                }
                                if (!has && !isEmptyString(builds[i].userId))
                                    buildsUsers.push(builds[i].userId);
                            }
                            //assign users to builds:
                            siteModules.User.find({ _ids: buildsUsers }).then((users) =>
                            {
                                for (var i = 0; i < builds.length; i++)
                                {
                                    for (var j = 0; j < users.length; j++)
                                    {
                                        if (builds[i].userId == users[j]._id)
                                        {
                                            builds[i]._user = users[j];
                                            builds[i]._champion = champion;
                                            break;
                                        }
                                    }
                                }
                                siteModules.Media.find({ champId: champion._id }).then((media) =>
                                {
                                    //finish:
                                    this.renderTemplate(req, res, 'champion-single.html', {
                                        champion: champion,
                                        game: game,
                                        builds: builds,
                                        media: media,
                                    });
                                }).catch((err) =>
                                {
                                    console.log("failed loading media for champion-single =>"+err.toString());
                                    //finish:
                                    this.renderTemplate(req, res, 'champion-single.html', {
                                        champion: champion,
                                        game: game,
                                        builds: builds,
                                    });
                                });
                            }).catch((err) =>
                            {
                                this.show500(req, res, err.toString());
                            });

                        });
                    });

                }
            }).catch((err) =>
            {
                this.show500(req, res, err.toString());
            });
        });
    }
}