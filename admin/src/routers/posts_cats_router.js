
import { AdminRouter } from "./admin_router";
import { API_URL, ADMIN_FILE_UPLOAD } from "../constants";
const fs = require('fs');
const path = require('path');
export default class PostsCatsPanelRouter extends AdminRouter
{
    constructor(AdminModules)
    {
        super();
        const PostCategory = AdminModules.PostCategory;
        this.requireAdmin();
        this.router.get('/', (req, res) =>
        {
            res.send(this.renderTemplate('posts-cats-list.html', {
                admin: req.session.admin
            }));
        });
        this.router.get('/new', (req, res) =>
        {
            PostCategory.insert({
                name : 'New Cat',
                slug : 'new-cat',
            }).then((result) =>
            {
                if (result._id)
                    res.redirect('/admin/posts/' + result._id + '/');
                else
                    res.send(result);
            }).catch((err) =>
            {
                res.send(err);
            });
        });
        this.router.get('/:_id/delete', (req, res) =>
        {
            PostCategory.delete(req.params._id).then((result) =>
            {
                res.send('<p>Post Cat Delete Result</p>'+JSON.stringify(result)+'<br><br><a href="/admin/posts-cats/">Back to Posts Cats.</a>');
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
            PostCategory.edit(_id, req.body).then((result) =>
            {
                res.redirect('/admin/posts/' + _id + '/?edit=success');
            }).catch((err) =>
            {
                res.send(err);
            });
        });
        this.router.get('/:_id', (req, res) =>
        {
            res.send(this.renderTemplate('posts-cats-single.html', {
                admin: req.session.admin,
                _id : req.params._id,
                fileUploadURL: ADMIN_FILE_UPLOAD
            }));
        });
    }
}