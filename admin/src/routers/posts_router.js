
import { AdminRouter } from "./admin_router";
import { API_URL, ADMIN_FILE_UPLOAD } from "../constants";
const fs = require('fs');
const path = require('path');
export default class PostsPanelRouter extends AdminRouter {
    constructor(AdminModules) {
        super();
        const Admin = AdminModules.Admin;
        const Post = AdminModules.Post;
        this.requireAdmin();
        this.router.get('/', (req, res) => {
            res.send(this.renderTemplate('posts-list.html', {
                admin: req.session.admin
            }));
        });
        this.router.get('/new', (req, res) => {
            Post.insert({
                adminId: req.session.admin._id,
                gameId: "?",
                title: 'New Post',
                slug: 'new-post',
                intro: '',
                body: '',
                thumbnail: "?",
                tags: [],
                categories: [],
            }).then((result) => {
                if (result._id)
                    res.redirect('/admin/posts/' + result._id + '/');
                else
                    res.send(result);
            }).catch((err) => {
                res.send(err);
            });
        });
        this.router.get('/:_id/delete', (req, res) => {
            Post.delete(req.params._id).then((result) => {
                res.send('<p>Post Delete Result</p>' + JSON.stringify(result) + '<br><br><a href="/admin/posts/">Back to Posts.</a>');
            }).catch((err) => {
                res.send(err);
            });
        });
        this.router.post('/:_id/edit', (req, res) => {
            if (req.body._id == undefined) {
                res.send({ error: "Missing _id", code: 500 });
                return;
            }
            if (req.body.slug != '') {
                const folderPath = path.resolve('../storage/posts/' + req.body._id) + "/";
                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath);
                }
            }
            console.log(req.body);
            req.body.tags = JSON.parse(req.body.tags);
            req.body.categories = JSON.parse(req.body.categories);
            const _id = req.body._id;
            delete (req.body._id);
            Post.edit(_id, req.body).then((result) => {
                res.redirect('/admin/posts/' + _id + '/?edit=success');
            }).catch((err) => {
                res.send(err);
            });

        });
        this.router.get('/:_id', (req, res) => {
            res.send(this.renderTemplate('post-single.html', {
                admin: req.session.admin,
                _id: req.params._id,
                fileUploadURL: ADMIN_FILE_UPLOAD
            }));
        });
    }
}