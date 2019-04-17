import SiteRouter from "./site_router";
import { SITE_URL } from "../constants";

export class SiteGalleryRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.get('/', (req, res) =>
        {
            if (req.query.tag)
                req.query = { tags: req.query.tag };
            if (req.query == undefined)
                req.query = {};
            req.query.limit = req.query.limit ? req.query.limit : 20;
            console.log(req.query);
            siteModules.Media.find(req.query).then((media) =>
            {
                let title = 'آرشیو';
                let finishAndRender = () =>
                {
                    this.renderTemplate(req, res, 'gallery/gallery-archive.html', {
                        title: title,
                        media: media,
                    });
                };
                if (req.query.title)
                {
                    title = req.query.title;
                    finishAndRender();
                }
                else if (req.query.gameId)
                {
                    siteModules.Cache.getGame((game) =>
                    {
                        if (game == undefined)
                        {
                            this.show500(req, res, 'game not found?!');
                            return;
                        }
                        title = game.name;
                        finishAndRender();
                    });
                }
                else if (req.query.champId)
                {
                    siteModules.Champion.getOne(req.query.champId).then((champion) =>
                    {
                        title = champion.name;
                        finishAndRender();
                    }).catch((err) =>
                    {
                        this.show500(req, res, err.toString());
                    });
                }
                else if (req.query.tags)
                {
                    title = req.query.tags;
                    finishAndRender();
                }
                else
                    finishAndRender();
            }).catch((err) =>
            {
                console.log('sth is very wrong');
                this.show500(req, res, err.toString());
            });
        });
        this.router.get('/load-more', (req, res) =>
        {
            const params = req.method == 'GET' ? req.query : req.body;
            if (params.limit == undefined)
                params.limit = 20;
            else
                params.limit = parseInt(params.limit);
            if (params.offset == undefined)
                params.offset = 0;
            else
                params.offset = parseInt(params.offset);
            siteModules.Media.find(params).then((media) =>
            {
                res.send({ code: 200, error: null, _data: media });
            }).catch((err) =>
            {
                res.send({ code: 500, error: err.toString(), _data: undefined });
            });
        });
        this.router.get('/:_id', (req, res) =>
        {
            siteModules.Media.getOne(req.params._id).then((media) =>
            {
                this.renderTemplate(req, res, 'gallery/gallery-single.html', {
                    media: media,
                });
            });
        });
    }
}