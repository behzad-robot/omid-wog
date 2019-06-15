import SiteRouter from "../site_router";
import { SITE_URL } from "../../constants";
import { isEmptyString, replaceAll } from "../../utils/utils";

export class SocialMainRouter extends SiteRouter
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
        this.router.post('/set-post-like', (req, res) =>
        {
            siteModules.SocialPost.apiCall('set-like-social-post', req.body).then((post) =>
            {
                res.send({ code: 200, error: null, _data: post });
            }).catch((err) =>
            {
                res.send({ code: 500, error: err.toString() });
            });
        });
        this.router.get('/', (req, res) =>
        {
            let fail = (err) =>
            {
                this.show500(req, res, err);
            }
            loadSocialPosts(siteModules, req.session.currentUser, { limit: 20 }).then((posts) =>
            {
                this.renderTemplate(req, res, 'social/social-home.html', {
                    posts: posts,
                });
            }).catch(fail);
        });

    }
}
const fixPost = function (post, currentUser)
{
    post._isMine = currentUser._id == post.userId;
    post._isLiked = false;
    for (var i = 0; i < post.likes.length; i++)
    {
        if (post.likes[i] == currentUser._id)
        {
            post._isLiked = true;
            break;
        }
    }
    return post;
}
const loadSocialPosts = function (siteModules, currentUser, params)
{
    return new Promise((resolve, reject) =>
    {
        siteModules.SocialPost.find(params).then((posts) =>
        {
            for (var i = 0; i < posts.length; i++)
                posts[i] = fixPost(posts[i], currentUser);
            let requiredUsersIds = [];
            for (var i = 0; i < posts.length; i++)
            {
                let has = false;
                for (var j = 0; j < requiredUsersIds.length; j++)
                {
                    if (requiredUsersIds[j] == posts[i].userId)
                    {
                        has = true;
                        break;
                    }
                }
                if (!has)
                    requiredUsersIds.push(posts[i].userId);
            }
            siteModules.User.find({ _ids: requiredUsersIds }).then((users) =>
            {
                for (var i = 0; i < posts.length; i++)
                {
                    for (var j = 0; j < users.length; j++)
                    {
                        if (posts[i].userId == users[j]._id)
                        {
                            posts[i]._user = users[j];
                            break;
                        }
                    }
                }
                resolve(posts);
            });
        }).catch(reject);
    });
}