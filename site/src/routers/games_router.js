import SiteRouter from "./site_router";

export default class SiteGamesRouter extends SiteRouter {
    constructor(siteModules) {
        super(siteModules);
        this.router.get('/', (req, res) => {
            res.send("This page is not implemented yet");
        });
        this.router.get('/:slug', (req, res) => {
            siteModules.Game.find({ slug: req.params.slug }).then((games) => {
                if (games.length == 0)
                    res.send("Game Not found!");
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
    }
}