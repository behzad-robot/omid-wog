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
            siteModules.SocialPost.apiCall('new-social-post', {
                userId: req.session.currentUser._id,
                userToken: req.session.currentUser.token,
                body: req.body.body,
                media : JSON.parse(req.body.media),

            }).then((post) =>
            {
                res.redirect('/social/posts/edit/' + post._id);
            }).catch((err) =>
            {
                this.show500(req, res, err.toString());
            });

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
        this.router.get('/edit/:_id', (req, res) =>
        {
            siteModules.SocialPost.getOne(req.params._id).then((post) =>
            {
                this.renderTemplate(req, res, 'social/social-edit-post.html', {
                    post: post,
                });
            }).catch((err) =>
            {
                this.show500(req, res, err);
            });
        });
        this.router.post('/edit-save/:_id', (req, res) =>
        {
            siteModules.SocialPost.apiCall('edit-social-post', {
                userId: req.session.currentUser._id,
                userToken: req.session.currentUser.token,
                _id: req.params._id,
                body: req.body.body,

            }).then((post) =>
            {
                res.redirect('/social/posts/edit/' + post._id);
            }).catch((err) =>
            {
                this.show500(req, res, err.toString());
            });
        });
        this.router.get('/delete/:_id', (req, res) =>
        {
            siteModules.SocialPost.apiCall('delete-social-post', {
                userId: req.session.currentUser._id,
                userToken: req.session.currentUser.token,
                _id: req.params._id,
            }).then((result) =>
            {
                res.redirect('/social/');
            }).catch((err) =>
            {
                this.show500(req, res, err.toString());
            });
        });
    }
}