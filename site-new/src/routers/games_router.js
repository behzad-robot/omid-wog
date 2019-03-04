import SiteRouter from "./site_router";
import { isEmptyString } from '../utils/utils';
export default class SiteGamesRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.get('/', (req, res) =>
        {
            this.renderTemplate(req, res, 'games-archive.html');
        });
        this.router.get('/:slug', (req, res) =>
        {
            // console.log(':|');
            if (req.params.slug == 'mortal-combat')
            {
                this.renderTemplate(req, res, 'coming-soon.html', {});
                return;
            }
            siteModules.Game.find({ slug: req.params.slug , _publicCast : true }).then((games) =>
            {
                if (games.length == 0)
                    this.show404(req, res);
                else
                {
                    // console.log("ok found!");
                    let game = games[0];
                    siteModules.Champion.find({ gameId: game._id }).then((champions) =>
                    {
                        var champions_1 = champions.slice(0, 28);
                        var champions_2 = champions.slice(28);
                        siteModules.Build.find({ gameId: game._id, limit: 10 }).then((builds) =>
                        {
                            console.log(`loaded ${builds.length} builds`);
                            var requiredUsers = [];
                            for (var i = 0; i < builds.length; i++)
                            {
                                var has = false;
                                for (var j = 0; j < requiredUsers.length; j++)
                                {
                                    if (requiredUsers[j] == builds[i].userId)
                                    {
                                        has = true;
                                        break;
                                    }
                                }
                                if (!isEmptyString(builds[i].userId))
                                    requiredUsers.push(builds[i].userId);
                            }
                            console.log(`needs ${requiredUsers.length} users`);
                            siteModules.User.find({ _ids: requiredUsers, _publicCast: true }).then((users) =>
                            {
                                console.log(`loaded ${users.length} users`);
                                for (var i = 0; i < builds.length; i++)
                                {
                                    //assign users:
                                    for (var j = 0; j < users.length; j++)
                                    {
                                        if (builds[i].userId == users[j]._id)
                                        {
                                            builds[i]._user = users[j];
                                            break;
                                        }
                                    }
                                    //assign champions:
                                    for (var j = 0; j < champions.length; j++)
                                    {
                                        if (builds[i].champId == champions[j]._id)
                                        {
                                            builds[i]._champ = {
                                                _id: champions[j]._id,
                                                name: champions[j].name,
                                                icon: champions[j].icon,
                                                icon_tall: champions[j].icon_tall,
                                            };
                                            break;
                                        }
                                    }
                                }
                                siteModules.Media.find({ gameId: game._id }).then((media) =>
                                {
                                    this.renderTemplate(req, res, 'game-single.html', {
                                        game: game,
                                        champions_1: champions_1,
                                        champions_2: champions_2,
                                        builds: builds,
                                        media : media,
                                    });
                                }).catch((err) =>
                                {
                                    this.show500(req, res, err.toString());
                                });
                                
                            });

                        }).catch((err) =>
                        {
                            this.show500(req, res, err.toString());
                        });

                    }).catch((err) =>
                    {
                        this.show500(req, res, err.toString());
                    });
                }
            }).catch((err) =>
            {
                res.send(err.toString());
            });


        });
        this.router.get('/:champSlug', (req, res) =>
        {
            siteModules.Champion.find({ slug: req.params.champSlug }).then((champions) =>
            {
                if (champions.length == 0)
                    this.show404(req, res);
                else
                {
                    let champion = champions[0];
                    champion = siteModules.Champion.fixOne(champion);
                    this.renderTemplate(req, res, 'champion-single', {
                        champion: champion,
                        gameSlug: req.params.gameSlug,
                    });
                }
            }).catch((err) =>
            {
                this.show500(req, res, err.toString());
            });
        });
    }
}