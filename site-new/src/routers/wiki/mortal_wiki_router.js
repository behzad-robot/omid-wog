import SiteRouter from "../site_router";
import { SITE_URL } from "../../constants";

export class MortalWikiRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.get('/', (req, res) =>
        {
            siteModules.Cache.getGame({ token: 'mortal' }).then((game) =>
            {
                //we also need characters:
                siteModules.Champion.find({ gameId: game._id, limit: 100 }).then((champions) =>
                {
                    for (var i = 0; i < champions.length; i++)
                        champions[i].siteUrl = SITE_URL('/wiki/mortal-kombat/characters/' + champions[i].slug);
                    let fiveChampions = [], fiveChampionsPart2 = [];
                    let tenChampsSlug = [
                        'scorpion', 'sub-zero', 'raiden', 'quan-chi', 'kitana',
                        'johnny-cage', 'cassie-cage', 'sonya-blade', 'kenshi', 'liu-kang'
                        //casy cage,sonia blade,kenshi ,reptile , liu kang
                    ];
                    for (var i = 0; i < tenChampsSlug.length; i++)
                    {
                        for (var j = 0; j < champions.length; j++)
                        {
                            if (champions[j].slug == tenChampsSlug[i])
                            {
                                if (i < 5)
                                    fiveChampions.push(champions[j]);
                                else
                                    fiveChampionsPart2.push(champions[j]);
                                break;
                            }
                        }
                    }
                    //add gallery:
                    siteModules.Media.find({ gameId: game._id, limit: 5 }).then((media) =>
                    {
                        //add news:
                        siteModules.Post.find({
                            '$or': [
                                { gameId: game._id },
                                { tags: 'mortal-kombat' }
                            ],
                            limit: 4,
                        }).then((posts) =>
                        {
                            //finish
                            this.renderTemplate(req, res, 'wiki-mortal/home.html', {
                                game: game,
                                fiveChampions: fiveChampions,
                                fiveChampionsPart2: fiveChampionsPart2,
                                champions: champions,
                                media: media,
                                posts: posts,
                            });
                        }).catch((err) =>
                        {
                            this.show500(req, res, err.toString());
                        });

                    });
                });
            }).catch((err) =>
            {
                this.show500(req, res, err.toString());
            });
        });
        this.router.get('/:gameSlug', (req, res) =>
        {
            var slug = req.params.gameSlug.toString().toLowerCase();
            siteModules.Cache.getGame({ slug: slug }).then((game) =>
            {
                if (game == null)
                {
                    this.show404(req, res);
                    return;
                }
                siteModules.Champion.find({ gameId: game._id }).then((cs) =>
                {
                    for (var i = 0; i < cs.length; i++)
                        cs[i].siteUrl = SITE_URL('/wiki/mortal-kombat/characters/' + cs[i].slug);
                    siteModules.Cache.getGame({ 'token': 'mortal' }).then((gameMortalMain) =>
                    {
                        siteModules.Media.find({ gameId: gameMortalMain._id }).then((media) =>
                        {
                            let champions = [];
                            let arr = [];
                            for (var i = 0; i < cs.length; i++)
                            {
                                if (i % 5 == 0)
                                {
                                    arr = { members: [] };
                                    champions.push(arr);
                                }
                                arr.members.push(cs[i]);
                            }
                            this.renderTemplate(req, res, 'wiki-mortal/game-single.html', {
                                game: game,
                                champions: champions,
                                media: media,
                            });
                        });
                    });

                });
            }).catch((err) =>
            {
                this.show500(req, res, err.toString());
            });
        });
        this.router.get('/characters/all', (req, res) =>
        {
            siteModules.Cache.getGame({ token: 'mortal' }).then((game) =>
            {
                if (game == null)
                {
                    this.show500(reqr, res, 'game is null');
                    return;
                }
                siteModules.Champion.find({ gameId: game._id }).then((champions) =>
                {
                    for (var i = 0; i < champions.length; i++)
                        champions[i].siteUrl = SITE_URL('/wiki/mortal-kombat/characters/' + champions[i].slug);
                    this.renderTemplate(req, res, 'wiki-mortal/champs-archive.html', {
                        game: game,
                        champions: champions,
                    });
                });
            });
        });
        this.router.get('/characters/:slug', (req, res) =>
        {
            req.params.slug = req.params.slug.toString().toLowerCase();
            if (req.params.slug.indexOf('-mobile') != -1)
            {
                req.params.slug = req.params.slug.replace('-mobile', '');
                res.redirect('/wiki/mortal-kombat/characters/' + req.params.slug + '/?tab=mobile');
                return;
            }
            siteModules.Cache.getGame({ token: 'mortal' }).then((game) =>
            {
                siteModules.Champion.find({ slug: req.params.slug }).then((champions) =>
                {
                    let champion = champions[0]; //the champ general info is here
                    //other versions are in other champions :D
                    siteModules.Media.find({ champId: champion._id }).then((media) =>
                    {
                        this.renderTemplate(req, res, 'wiki-mortal/champ-single.html', {
                            game: game,
                            champion: champion,
                            champions: champions,
                            media: media,
                        });
                    });
                }).catch((err) =>
                {
                    this.show500(req, res, err.toString());
                });
            });
        });
        this.router.get('/factions/:slug', (req, res) =>
        {
            siteModules.Cache.getGame({ token: 'mortal' }).then((game) =>
            {
                let faction = undefined;
                for (var i = 0; i < game.factions.length; i++)
                {
                    if (game.factions[i].slug == req.params.slug)
                    {
                        faction = game.factions[i];
                        break;
                    }
                }
                this.renderTemplate(req, res, 'wiki-mortal/faction-single.html', {
                    game: game,
                    faction: faction,
                });
            });
        });
    }
}