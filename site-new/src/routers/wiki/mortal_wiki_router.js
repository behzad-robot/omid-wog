import SiteRouter from "../site_router";

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
                    var fiveChamps = [];
                    for (var i = 0; i < 5 && i < champions.length; i++)
                    {
                        if ((champions[i].slug == 'scorpion') || (champions[i].slug == 'sub-zero') || (champions[i].slug == 'kitana')
                            || (champions[i].slug == 'raiden') || (champions[i].slug == 'quan-chi'))
                            fiveChamps.push(champions[i]);
                    }
                    //add gallery:
                    siteModules.Media.find({ gameId: game._id }).then((media) =>
                    {
                        //add news:
                        siteModules.Post.find({
                            '$or': [
                                { gameId: game._id },
                                { tags: 'mortal-kombat' }
                            ]
                        }).then((posts) =>
                        {
                            //finish
                            this.renderTemplate(req, res, 'wiki-mortal/home.html', {
                                game: game,
                                fiveChampions: fiveChamps,
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
        this.router.get('/characters/:slug', (req, res) =>
        {
            req.params.slug = req.params.slug.toString().toLowerCase();
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
                            media : media,
                        });
                    });
                }).catch((err) =>
                {
                    this.show500(req, res, err.toString());
                });
            });
        });
    }
}