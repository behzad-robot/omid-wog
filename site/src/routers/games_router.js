import SiteRouter from "./site_router";

export default class SiteGamesRouter extends SiteRouter {
    constructor(siteModules) {
        super(siteModules);
        this.router.get('/', (req, res) => {
            this.renderTemplate(req,res,'games-archive.html');
        });
        this.router.get('/:slug', (req, res) => {
            siteModules.Game.find({ slug: req.params.slug }).then((games) => {
                if (games.length == 0)
                    this.show404(req,res);
                else {
                    let game = games[0];
                    game = siteModules.Game.fixOne(game);
                    this.renderTemplate(req, res, 'game-single.html', {
                        game: game,
                    });
                }
            }).catch((err) => {
                res.send(err.toString());
            });


        });
        this.router.get('/:champSlug',(req,res)=>{
            siteModules.Champion.find({slug : req.params.champSlug}).then((champions)=>{
                if( champions.length == 0 )
                    this.show404(req,res);
                else
                {
                    let champion = champions[0];
                    champion = siteModules.Champion.fixOne(champion);
                    this.renderTemplate(req,res,'champion-single',{
                        champion : champion,
                        gameSlug : req.params.gameSlug,
                    });
                }
            }).catch((err)=>{
                this.show500(req,res,err.toString());
            });
        });
    }
}