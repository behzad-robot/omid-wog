import SiteRouter from "./site_router";

export default class SitePostsRouter extends SiteRouter {
    constructor(siteModules) {
        super(siteModules);
        this.router.get('/', (req, res) => {
            siteModules.Post.find({}, 20).then((posts) => {
                posts = siteModules.Post.fixAll(posts);
                siteModules.Post.find({}).then((leftPosts) => {
                    leftPosts = siteModules.Post.fixAll(leftPosts);
                    this.renderTemplate(req, res, 'posts-archive.html', {
                        posts: posts,
                        leftPosts: leftPosts,
                        rightPosts: leftPosts,
                    });
                });
            }).catch((err) => {
                res.send(err.toString());
            });

        });
        this.router.get('/:slug', (req, res) => {
            siteModules.Post.find({ slug: req.params.slug }).then((posts) => {
                if (posts.length == 0) {
                    this.show404(req, res);
                    return;
                }
                else {
                    let post = posts[0];
                    post = siteModules.Post.fixOne(post);
                    this.renderTemplate(req, res, 'post-single.html', {
                        post: post,
                    });
                }
            }).catch((err) => {
                res.send(err.toString());
            });


        });
    }
}