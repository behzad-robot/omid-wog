import SiteRouter from "./site_router";
import BehzadTimer from "../libs/behzad_timer";
import { isEmptyString } from "../utils/utils";

const timer = new BehzadTimer("posts_router", true);
export default class SitePostsRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.get('/', (req, res) =>
        {
            siteModules.Post.find({ limit: 20 }).then((posts) =>
            {
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
                                break;
                            }
                        }
                    }
                    this.renderTemplate(req, res, 'posts-archive.html', {
                        posts: posts,
                        leftPosts: [],
                        rightPosts: [],
                    });
                }).catch((err) =>
                {
                    this.show500(req, res, err.toString());
                });

            }).catch((err) =>
            {
                res.send(err.toString());
            });

        });
        this.router.get('/_id/:_id', (req, res) =>
        {
            timer.tick('Request Arrived');
            siteModules.Post.find({ _id: req.params._id, _draft: 'all', _publicCast: true }).then((posts) =>
            {
                if (posts.length == 0)
                {
                    console.log("post not found");
                    this.show404(req, res);
                    return;
                }
                else
                {
                    timer.tick('Post Found');
                    let post = posts[0];
                    post = siteModules.Post.fixOne(post);
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
                        timer.tick('Cats Setup Done');
                        siteModules.User.getOne(post.authorId).then((author) =>
                        {
                            timer.tick('Author Setup');
                            post._author = siteModules.User.public(author);
                            //also get recommended posts:
                            console.log('lets find a recommended posts');
                            siteModules.Cache.posts_recommended.getData((err, recommendedPosts) =>
                            {
                                if (err)
                                {
                                    this.show500(req, res, err);
                                    return;
                                }
                                //also get recommended posts:
                                console.log('lets find a recommended posts');
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
                                        for(var i = 0 ; i < comments.length;i++)
                                        {
                                            var has = false;
                                            for(var j = 0 ; j < commentsUsers.length;j++)
                                            {
                                                if(commentsUsers[j] == comments[i].userId)
                                                {
                                                    has = true;
                                                    break;
                                                }
                                            }
                                            if(!has && !isEmptyString(comments[i].userId))
                                                commentsUsers.push(comments[i].userId);
                                        }
                                        siteModules.User.find({ _ids: commentsUsers, _publicCast: true }).then((users) =>
                                        {
                                            for(var i = 0 ; i < comments.length;i++)
                                            {
                                                for(var j = 0 ; j < users.length;j++)
                                                {
                                                    if(comments[i].userId == users[j]._id)
                                                    {
                                                        comments[i]._user = users[j];
                                                        break;
                                                    }
                                                }
                                            }
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
            }).catch((err) =>
            {
                res.send(err.toString());
            });


        });
        this.router.get('/:slug', (req, res) =>
        {
            siteModules.Post.find({ slug: req.params.slug }).then((posts) =>
            {
                if (posts.length == 0)
                {
                    this.show404(req, res);
                    return;
                }
                else
                {
                    let post = posts[0];
                    post = siteModules.Post.fixOne(post);
                    this.renderTemplate(req, res, 'post-single.html', {
                        post: post,
                    });
                }
            }).catch((err) =>
            {
                res.send(err.toString());
            });


        });

    }
    postSingle(req, res)
    {

    }
}