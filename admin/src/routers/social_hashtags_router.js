
import { AdminRouter } from "./admin_router";
import { API_URL, ADMIN_FILE_UPLOAD } from "../constants";
import { updateCache } from "../utils/cache";
const fs = require('fs');
const path = require('path');
export default class SocialHashTagsPanelRouter extends AdminRouter
{
    constructor(AdminModules)
    {
        super();
        const SocialHashTag = AdminModules.SocialHashTag;
        this.requireAdmin();
        this.router.use((req, res, next) =>
        {
            // console.log(req.url);
            if (req.url.indexOf('edit') != -1 || req.url.indexOf('new') != -1 || req.url.indexOf('delete') != -1)
            {
                console.log('update cache for social-hashtags-all');
                updateCache('social-hashtags-all');
            }
            next();
        });
        this.router.get('/', (req, res) =>
        {
            res.send(this.renderTemplate('social-hashtags-list.html', {
                admin: req.session.admin
            }));
        });
        this.router.get('/new', (req, res) =>
        {
            SocialHashTag.insert({
                name : '',
                icon : '?',
                tags : [],
                gameId : '',

            }).then((result) =>
            {
                if (result._id)
                    res.redirect('/admin/social-hashtags/' + result._id + '/');
                else
                    res.send(result);
            }).catch((err) =>
            {
                res.send(err);
            });
        });
        this.router.get('/:_id/delete', (req, res) =>
        {
            SocialHashTag.delete(req.params._id).then((result) =>
            {
                res.send('<p>Post Cat Delete Result</p>' + JSON.stringify(result) + '<br><br><a href="/admin/social-hashtags/">Back to Social HashTags.</a>');
            }).catch((err) =>
            {
                res.send(err);
            });
        });
        this.router.post('/:_id/edit', (req, res) =>
        {
            if (req.body._id == undefined)
            {
                res.send({ error: "Missing _id", code: 500 });
                return;
            }
            req.body._draft = req.body._draft == 'on' ? true : false;
            const _id = req.body._id;
            delete (req.body._id);
            req.body.tags = JSON.parse(req.body.tags);
            SocialHashTag.edit(_id, req.body).then((result) =>
            {
                res.redirect('/admin/social-hashtags/' + _id + '/?edit=success');
            }).catch((err) =>
            {
                res.send(err);
            });
        });
        this.router.get('/:_id', (req, res) =>
        {
            res.send(this.renderTemplate('social-hashtag-single.html', {
                admin: req.session.admin,
                _id: req.params._id,
                fileUploadURL: ADMIN_FILE_UPLOAD
            }));
        });
    }
}