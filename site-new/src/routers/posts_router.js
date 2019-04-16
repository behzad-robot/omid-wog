import SiteRouter from "./site_router";
import BehzadTimer from "../libs/behzad_timer";
import { isEmptyString } from "../utils/utils";

const timer = new BehzadTimer("posts_router", true);
const fs = require('fs');
const path = require('path');
export default class SitePostsRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.siteModules = siteModules;
        this.postSingle = this.postSingle.bind(this);
        this.postsArchive = this.postsArchive.bind(this);
        this.router.get('/', (req, res) =>
        {
            siteModules.Post.find({ limit: 20 }).then((posts) =>
            {
                this.postsArchive(req, res, posts, { title: 'اخبار و مقالات', hasGrid: true });
            }).catch((err) =>
            {
                res.send(err.toString());
            });

        });
        this.router.all('/load-more', (req, res) =>
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
            this.siteModules.Post.find(params).then((posts) =>
            {
                let requiredUsers = [];
                for (var i = 0; i < posts.length; i++)
                {
                    var hasUser = false;
                    for (var j = 0; j < requiredUsers.length; j++)
                    {
                        if (requiredUsers[j] == posts[i].authorId)
                        {
                            hasUser = true;
                            break;
                        }
                    }
                    if (!hasUser)
                        requiredUsers.push(posts[i].authorId);
                }
                this.siteModules.User.find({ _ids: requiredUsers }).then((users) =>
                {
                    console.log(`got ${users.length} users`);
                    for (var i = 0; i < posts.length; i++)
                    {
                        for (var j = 0; j < users.length; j++)
                        {
                            if (posts[i].authorId == users[j]._id)
                            {
                                posts[i]._author = this.siteModules.User.public(users[j]);
                                break;
                            }
                        }
                    }
                    res.send({ code: 200, error: null, _data: posts });
                }).catch((err) =>
                {
                    res.send({ code: 500, error: err.toString() });
                });

            }).catch((err) =>
            {
                res.send({ code: 500, error: err.toString() });
            });
        });
        this.router.get('/categories/:slug', (req, res) =>
        {
            this.siteModules.Cache.allPostsCats.getData((err, cats) =>
            {
                let category = undefined;
                for (var i = 0; i < cats.length; i++)
                {
                    if (cats[i].slug == req.params.slug)
                    {
                        category = cats[i];
                        break;
                    }
                }
                if (category == undefined)
                {
                    this.show500(req, res, 'Category Not found!');
                    return;
                }
                this.siteModules.Post.find({ categories: category._id, limit: 20 }).then((posts) =>
                {
                    this.postsArchive(req, res, posts, { title: category.name, hasGrid: (category.slug == 'news' || category.slug == 'articles'), loadMoreParams: '?categories=' + category._id });
                }).catch((err) =>
                {
                    this.show500(req, res, err.toString());
                });
            });
        });
        this.router.get('/tags/:slug', (req, res) =>
        {
            this.siteModules.Post.find({ tags: req.params.slug }).then((posts) =>
            {
                this.postsArchive(req, res, posts, { title: req.params.slug, hasGrid: false });
            }).catch((err) =>
            {
                this.show500(req, res, err.toString());
            });
        });
        this.router.get('/search', (req, res) =>
        {
            this.siteModules.Post.apiCall('search', { s: req.query.s , limit : 50 , _draft : false }).then((posts) =>
            {
                posts = this.siteModules.Post.fixAll(posts);
                this.postsArchive(req, res, posts, { title: 'جستجوی '+req.query.s, hasGrid: false });
            }).catch((err) =>
            {
                this.show500(req,res,err.toString());
            });
        });
        this.router.get('/_id/:_id', (req, res) =>
        {
            siteModules.Post.find({ _id: req.params._id, _draft: 'all', _publicCast: true }).then((posts) =>
            {
                if (posts.length == 0)
                {
                    this.show404(req, res);
                    return;
                }
                else
                {
                    timer.tick('Post Found');
                    let post = posts[0];
                    this.postSingle(req, res, post);
                }
            }).catch((err) =>
            {
                res.send(err.toString());
            });
        });
        this.router.get('/:slug', (req, res) =>
        {
            req.params.slug = req.params.slug.toString().toLowerCase();
            siteModules.Post.find({ slug: req.params.slug, _publicCast: true }).then((posts) =>
            {
                if (posts.length == 0)
                {
                    this.show404(req, res);
                    return;
                }
                else
                {
                    let post = posts[0];
                    this.postSingle(req, res, post);
                }
            }).catch((err) =>
            {
                res.send(err.toString());
            });
        });

    }
    postsArchive(req, res, posts, settings = {
        title: '',
        hasGrid: false,
        loadMoreParams: '',
    })
    {
        var siteModules = this.siteModules;
        var requiredUsers = [];
        for (var i = 0; i < posts.length; i++)
        {
            var has = false;
            for (var j = 0; j < requiredUsers.length; j++)
            {
                if (requiredUsers[j] == posts[i].authorId)
                {
                    has = true;
                    break;
                }
            }
            if (!has && !isEmptyString(posts[i].authorId))
                requiredUsers.push(posts[i].authorId);
        }
        siteModules.User.find({ _ids: requiredUsers }).then((users) =>
        {
            for (var i = 0; i < posts.length; i++)
            {
                for (var j = 0; j < users.length; j++)
                {
                    if (posts[i].authorId == users[j]._id)
                    {
                        posts[i]._author = users[j];
                        // posts[i].isSmall = posts[i].extras.bigBox ? '' : 'post-box-small';
                        break;
                    }
                }
            }
            //gridPosts:
            fs.readFile(path.resolve('../storage/caches/posts-grid.json'), (err, gridFile) =>
            {
                if (err)
                {
                    this.show500(req, res, err.toString());
                    return;
                }
                var gridIds = JSON.parse(gridFile.toString());
                // console.log("gridIds=>"+JSON.stringify(gridIds));
                siteModules.Post.find({ _ids: gridIds }).then((gs) =>
                {
                    let gridPosts = [];
                    for (var i = 0; i < gridIds.length; i++)
                    {
                        for (var j = 0; j < gs.length; j++)
                        {
                            if (gs[j]._id == gridIds[i])
                            {
                                gridPosts.push(gs[j]);
                                break;
                            }
                        }
                    }
                    // console.log(gridPosts);
                    fs.readFile(path.resolve('../storage/aparat/posts-archive-aparat.json'), (err, aparatFile) =>
                    {
                        if (err)
                        {
                            this.show500(req, res, err.toString());
                            return;
                        }
                        var aparatVideos = JSON.parse(aparatFile.toString());
                        fs.readFile(path.resolve('../storage/caches/upcoming-games.json'), (err, upComingGamesFile) =>
                        {
                            if (err)
                            {
                                this.show500(req, res, err.toString());
                                return;
                            }
                            var upComingGames = JSON.parse(upComingGamesFile.toString());
                            this.renderTemplate(req, res, 'posts-archive.html', {
                                title: settings.title,
                                hasGrid: settings.hasGrid,
                                posts: posts,
                                gridPosts0: gridPosts[0],
                                gridPosts1: gridPosts[1],
                                gridPosts2: gridPosts[2],
                                gridPosts3: gridPosts[3],
                                gridPosts4: gridPosts[4],
                                aparatVideos: aparatVideos,
                                upComingGames: upComingGames,
                                hasLoadMore: posts.length >= 20,
                                loadMoreParams: settings.loadMoreParams,
                            });
                        });
                    });
                });
            });
        }).catch((err) =>
        {
            this.show500(req, res, err.toString());
        });
    }
    postSingle(req, res, post)
    {
        timer.tick('Request Arrived');
        const siteModules = this.siteModules;
        siteModules.Cache.allPostsCats.getData((err, cats) =>
        {
            if (err)
            {
                this.show500(req, res, err);
                return;
            }
            post._cats = [];
            for (var i = 0; i < post.categories.length; i++)
            {
                for (var j = 0; j < cats.length; j++)
                {
                    if (post.categories[i] == cats[j]._id)
                        post._cats.push(cats[j]);
                }
            }
            siteModules.User.getOne(post.authorId).then((author) =>
            {
                post._author = siteModules.User.public(author);
                //also get recommended posts:
                siteModules.Cache.posts_recommended.getData((err, recommendedPosts) =>
                {
                    if (err)
                    {
                        this.show500(req, res, err);
                        return;
                    }
                    //also get recommended posts:
                    siteModules.Cache.posts_recommended.getData((err, recommendedPosts) =>
                    {
                        if (err)
                        {
                            this.show500(req, res, err);
                            return;
                        }
                        siteModules.Comment.find({ objectType: 'posts', objectId: post._id }).then((comments) =>
                        {
                            //find related users:
                            var commentsUsers = [];
                            for (var i = 0; i < comments.length; i++)
                            {
                                var has = false;
                                for (var j = 0; j < commentsUsers.length; j++)
                                {
                                    if (commentsUsers[j] == comments[i].userId)
                                    {
                                        has = true;
                                        break;
                                    }
                                }
                                if (!has && !isEmptyString(comments[i].userId))
                                    commentsUsers.push(comments[i].userId);
                            }
                            siteModules.User.find({ _ids: commentsUsers, _publicCast: true }).then((users) =>
                            {
                                for (var i = 0; i < comments.length; i++)
                                {
                                    for (var j = 0; j < users.length; j++)
                                    {
                                        if (comments[i].userId == users[j]._id)
                                        {
                                            comments[i]._user = users[j];
                                            break;
                                        }
                                    }
                                }
                                if (comments.length == 0)
                                    comments = undefined;
                                this.renderTemplate(req, res, 'post-single.html', {
                                    post: post,
                                    recommendedPosts: recommendedPosts,
                                    comments: comments,
                                });
                            }).catch((err) =>
                            {
                                this.show500(req, res, err);
                            });

                        }).catch((err) =>
                        {
                            this.show500(req, res, err);
                        });

                    });
                });
            }).catch((err) =>
            {
                post._author = {
                    _id: "??",
                    username: "Not-Found",
                };
                post._author = siteModules.User.fixOne(post._author);
                this.renderTemplate(req, res, 'post-single.html', {
                    post: post,
                });
            });

        });
    }
}