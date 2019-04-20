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
                let loadMoreParams = '';
                let finishAndRender = () =>
                {
                    if (title == 'mobile')
                        title = 'تصویر پس زمینه موبایل';
                    else if (title == 'wallpaper')
                        title = 'تصویر پس زمینه'
                    this.renderTemplate(req, res, 'gallery/gallery-archive.html', {
                        title: title,
                        media: media,
                        loadMoreParams : loadMoreParams,
                    });
                };
                if (req.query.title)
                {
                    title = req.query.title;
                    loadMoreParams = '';
                    finishAndRender();
                }
                else if (req.query.gameId)
                {
                    console.log(':) gameId case!');
                    loadMoreParams = '?gameId=' + req.query.gameId;
                    siteModules.Cache.getGame({ _id: req.query.gameId }).then((game) =>
                    {
                        console.log(game.name);
                        if (game == undefined)
                        {
                            this.show500(req, res, 'game not found?!');
                            return;
                        }
                        title = game.name;
                        console.log('title is up' + title);
                        finishAndRender();
                    });
                }
                else if (req.query.champId)
                {
                    siteModules.Champion.getOne(req.query.champId).then((champion) =>
                    {
                        title = champion.name;
                        loadMoreParams = '?champId=' + champion._id;
                        finishAndRender();
                    }).catch((err) =>
                    {
                        this.show500(req, res, err.toString());
                    });
                }
                else if (req.query.tags)
                {
                    title = req.query.tags;
                    loadMoreParams = '?tag=' + req.query.tags;
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
            console.log(params);
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