
import { AdminRouter } from "./admin_router";
import { API_URL, ADMIN_FILE_UPLOAD } from "../constants";
import { updateCache } from "../utils/cache";
const fs = require('fs');
const path = require('path');
export default class PostsPanelRouter extends AdminRouter
{
    constructor(AdminModules)
    {
        super();
        const Admin = AdminModules.Admin;
        const Post = AdminModules.Post;
        this.requireAdmin();
        this.router.use((req, res, next) =>
        {
            // console.log(req.url);
            if (req.url.indexOf('edit') != -1 || req.url.indexOf('new') != -1 || req.url.indexOf('delete') != -1)
            {
                updateCache('navbar-news');
                updateCache('navbar-articles');
            }
            next();
        });
        this.router.get('/collections', (req, res) =>
        {
            var postsGrid = fs.readFileSync(path.resolve('../storage/caches/posts-grid.json')).toString();
            var postsRecommended = fs.readFileSync(path.resolve('../storage/caches/posts-recommended-ids.json')).toString();
            var upComingGames = fs.readFileSync(path.resolve('../storage/caches/upcoming-games.json')).toString();
            res.send(this.renderTemplate('collections.html', {
                admin: req.session.admin,
                postsGrid: postsGrid,
                postsRecommended: postsRecommended,
                upComingGames: upComingGames,
            }));
        });
        this.router.post('/collections/save', (req, res) =>
        {
            var postsGridFilePath = path.resolve('../storage/caches/posts-grid.json');
            var postsRecommendedFilePath = path.resolve('../storage/caches/posts-recommended-ids.json');
            var upcomingGamesFilePath = path.resolve('../storage/caches/upcoming-games.json');
            var str = '';
            fs.writeFile(postsGridFilePath, req.body.postsGrid, (err) =>
            {
                if (err)
                    str += err+'\n';
                fs.writeFile(postsRecommendedFilePath, req.body.postsRecommended, (err) =>
                {
                    if (err)
                        str += err+'\n';
                    fs.writeFile(upcomingGamesFilePath,req.body.upComingGames,(err)=>{
                        if(err)
                            str += err+'\n';
                        if(str != '')
                            res.status(500).send('Error:'+str);
                        else
                            res.redirect('/admin/posts/collections');
                    });
                });
            });
        });
        this.router.get('/', (req, res) =>
        {
            res.send(this.renderTemplate('posts-list.html', {
                admin: req.session.admin
            }));
        });
        this.router.get('/new', (req, res) =>
        {
            Post.insert({
                authorId: req.session.admin._id,
                gameId: "?",
                title: 'New Post',
                slug: 'new-post',
                intro: '',
                body: '',
                thumbnail: "?",
                tags: [],
                categories: [],
                _seo: {
                    'metaDescription': '',
                    'focusKeyword': '',
                    'keywords': '',
                },
                _draft : true,
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
            Post.delete(req.params._id).then((result) =>
            {
                res.send('<p>Post Delete Result</p>' + JSON.stringify(result) + '<br><br><a href="/admin/posts/">Back to Posts.</a>');
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
            if (req.body.slug != '')
            {
                const folderPath = path.resolve('../storage/posts/' + req.body._id) + "/";
                if (!fs.existsSync(folderPath))
                {
                    fs.mkdirSync(folderPath);
                }
            }
            req.body._draft = req.body._draft == 'on' ? true : false;
            req.body.tags = JSON.parse(req.body.tags);
            req.body.categories = JSON.parse(req.body.categories);
            req.body._seo = JSON.parse(req.body._seo);
            req.body.extras = JSON.parse(req.body.extras);
            const _id = req.body._id;
            delete (req.body._id);
            Post.edit(_id, req.body).then((result) =>
            {
                res.redirect('/admin/posts/' + _id + '/?edit=success');
            }).catch((err) =>
            {
                res.send(err);
            });

        });
        this.router.get('/:_id', (req, res) =>
        {
            res.send(this.renderTemplate('post-single.html', {
                admin: req.session.admin,
                _id: req.params._id,
                fileUploadURL: ADMIN_FILE_UPLOAD
            }));
        });

    }
}