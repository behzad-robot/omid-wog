import SiteRouter from "../site_router";
import { SITE_URL } from "../../constants";
import { isEmptyString, replaceAll } from "../../utils/utils";

const fs = require('fs');
const path = require('path');
const SUGGESTED_USERS_PATH = path.resolve('../storage/social-posts/config/recommended-users.json');
const SUGGESTED_HASHTAGS_PATH = path.resolve('../storage/social-posts/config/recommended-hashtags.json');

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
        this.router.get('/follow-user', (req, res) =>
        {
            if (isEmptyString(req.query.userId))
            {
                this.show500(req, res, 'Parameter Missing userId');
                return;
            }
            let follow = req.query.follow ? req.query.follow == 'true' : true;
            siteModules.User.apiCall('set-follow-user', { userId: req.session.currentUser._id, userToken: req.session.currentUser.token, target: req.query.userId, follow: follow }).then((user) =>
            {
                req.session.currentUser = user;
                req.session.save(() =>
                {
                    if (!isEmptyString(req.query.redirect))
                        res.redirect(req.query.redirect);
                    else
                        res.send(user);
                });

            }).catch((err) =>
            {
                this.show500(req, res, err);
            });
        });
        this.router.get('/follow-hashtag', (req, res) =>
        {
            if (isEmptyString(req.query.tagId))
            {
                this.show500(req, res, 'Parameter Missing tagId');
                return;
            }
            let follow = req.query.follow ? req.query.follow == 'true' : true;
            siteModules.User.apiCall('set-follow-hashtag', { userId: req.session.currentUser._id, userToken: req.session.currentUser.token, tagId: req.query.tagId, follow: follow }).then((user) =>
            {
                req.session.currentUser = user;
                req.session.save(() =>
                {
                    if (!isEmptyString(req.query.redirect))
                        res.redirect(req.query.redirect);
                    else
                        res.send(user);
                });
            }).catch((err) =>
            {
                this.show500(req, res, err);
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
                const loadPostComments = function (index, finish)
                {
                    if (index >= posts.length)
                    {
                        finish();
                        return;
                    }
                    loadComments(siteModules, req.session.currentUser, { objectType: 'social-posts', objectId: posts[index]._id, limit: 6 }).then((comments) =>
                    {
                        posts[index]._comments = comments;
                        loadPostComments(index + 1, finish);
                    }).catch(fail);
                };
                loadPostComments(0, () =>
                {
                    getSuggestedUsers(siteModules, req.session.currentUser).then((suggestedUsers) =>
                    {
                        getSuggestedHashTags(siteModules, req.session.currentUser).then((suggestedHashtags) =>
                        {
                            siteModules.SocialChallenge.find({ active: true }).then((challenges) =>
                            {
                                this.renderTemplate(req, res, 'social/social-home.html', {
                                    posts: posts,
                                    suggestedUsers: suggestedUsers,
                                    hasSuggestedUsers: suggestedUsers.length != 0,
                                    suggestedHashtags: suggestedHashtags,
                                    hasSuggestedHashtags: suggestedHashtags.length != 0,
                                    challenges : challenges,
                                    hasChallenges : challenges.length != 0 ,
                                });
                            });

                        }).catch(fail);

                    }).catch(fail);

                });
            }).catch(fail);
        });
        this.router.get('/posts/:_id', (req, res) =>
        {
            let fail = (err) =>
            {
                this.show500(req, res, err);
            };
            siteModules.SocialPost.getOne(req.params._id).then((post) =>
            {
                post = fixPost(post, req.session.currentUser);
                siteModules.User.getOne(post.userId).then((user) =>
                {
                    post._user = user;
                    loadComments(siteModules, req.session.currentUser, { objectType: 'social-posts', objectId: post._id, limit: 500, }).then((comments) =>
                    {
                        post._comments = comments;
                        this.renderTemplate(req, res, 'social/social-post-single.html', {
                            post: post,
                        });
                    }).catch(fail);
                }).catch(fail);

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
const loadComments = function (siteModules, currentUser, params)
{
    return new Promise((resolve, reject) =>
    {
        siteModules.Comment.find(params).then((comments) =>
        {
            let requiredUsersIds = [];
            for (var i = 0; i < comments.length; i++)
            {
                let has = false;
                for (var j = 0; j < requiredUsersIds.length; j++)
                {
                    if (requiredUsersIds[j] == comments[i].userId)
                    {
                        has = true;
                        break;
                    }
                }
                if (!has)
                    requiredUsersIds.push(comments[i].userId);
            }
            siteModules.User.find({ _ids: requiredUsersIds }).then((users) =>
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
                for (var i = 0; i < comments.length; i++)
                {
                    comments[i]._isLiked = false;
                    comments[i]._isMine = comments[i].userId == currentUser._id;
                    for (var j = 0; j < comments[i].likes.length; j++)
                    {
                        if (comments[i].likes[j] == currentUser._id)
                        {
                            comments[i]._isLiked = true;
                            break;
                        }
                    }
                }
                resolve(comments);
            }).catch(reject);
        }).catch(reject);
    });
}
const getSuggestedUsers = function (siteModules, currentUser)
{
    return new Promise((resolve, reject) =>
    {
        const userIds = JSON.parse(fs.readFileSync(SUGGESTED_USERS_PATH).toString());
        siteModules.User.find({ _ids: userIds }).then((users) =>
        {
            let results = [];
            for (var i = 0; i < users.length; i++)
            {
                let has = false;
                if (currentUser._id == users[i]._id)
                    continue;
                for (var j = 0; j < currentUser.social.followings.length; j++)
                {
                    if (currentUser.social.followings[j] == users[i]._id)
                    {
                        has = true;
                        break;
                    }
                }
                if (!has)
                    results.push(users[i]);
            }
            resolve(results);
        }).catch(reject);
    });
}
const getSuggestedHashTags = function (siteModules, currentUser)
{
    return new Promise((resolve, reject) =>
    {
        const tagIds = JSON.parse(fs.readFileSync(SUGGESTED_HASHTAGS_PATH).toString());
        siteModules.SocialHashtag.find({ _ids: tagIds }).then((hashTags) =>
        {
            let results = [];
            for (var i = 0; i < hashTags.length; i++)
            {
                let has = false;
                for (var j = 0; j < currentUser.social.followedHashtags.length; j++)
                {
                    if (hashTags[i]._id == currentUser.social.followedHashtags[j])
                    {
                        has = true;
                        break;
                    }
                }
                if (!has)
                    results.push(hashTags[i]);
            }
            resolve(results);
        }).catch(reject);
    });
}