import SiteRouter from "../site_router";
import { SITE_URL } from "../../constants";
import { isEmptyString, replaceAll } from "../../utils/utils";

export class SocialPostsRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.use((req, res, next) =>
        {
            if (!this.isLoggedIn(req))
            {
                res.redirect('/login/?redirect=/social');
                return;
            }
            next();
        });
        this.router.get('/new', (req, res) =>
        {
            this.renderTemplate(req, res, 'social/social-new-post.html', {

            });
        });
        this.router.post('/new-save', (req, res) =>
        {
            //step 1: check media:
            if (isEmptyString(req.body.media))
            {
                res.redirect('/social/posts/new/?msg=empty-media');
                return;
            }
            let media = JSON.parse(req.body.media);
            if (media == undefined || media.length == 0)
            {
                res.redirect('/social/posts/new/?msg=empty-media');
                return;
            }
            

        });
        this.router.post('/uploader', (req, res) =>
        {
            this.handleFile(req, res, 'media', 'social-posts/draft/').then((file) =>
            {
                res.send({ code: 200, file: file });
            }).catch((err) =>
            {
                res.send({ code: 500, error: err.toString() });
            });
        });
    }
}