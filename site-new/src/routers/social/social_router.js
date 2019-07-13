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
        this.router.post('/set-bookmark', (req, res) =>
        {
            if (isEmptyString(req.body.postId))
            {
                res.send({ code: 500, error: 'postId missing' });
                return;
            }
            if (isEmptyString(req.body.userId) || isEmptyString(req.body.userToken))
            {
                res.send({ code: 500, error: 'user parameters missing' });
                return;
            }
            if (req.body.bookmark == undefined)
            {
                res.send({ code: 500, error: 'bookmark missing' });
                return;
            }
            siteModules.SocialPost.apiCall('set-bookmark', {
                userId: req.body.userId,
                userToken: req.body.userToken,
                postId: req.body.postId,
                bookmark: req.body.bookmark
            }).then((user) =>
            {
                req.session.currentUser = user;
                req.session.save(() =>
                {
                    res.send({ code: 200, success: true, postId: req.body.postId });
                });
            }).catch((err) =>
            {
                res.send({ code: 500, error: err.toString() });
            });
        });
        this.router.get('/', (req, res) =>
        {
            if (req.session.currentUser.social.followedHashtags.length == 0)
            {
                res.redirect('/social/welcome');
                return;
            }
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
                        posts[index]._hasComments = comments.length != 0;
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
                                siteModules.SocialChatGroup.find({}).then((chatGroups) =>
                                {
                                    this.renderTemplate(req, res, 'social/social-home.html', {
                                        chatGroups: chatGroups,
                                        posts: posts,
                                        suggestedUsers: suggestedUsers,
                                        hasSuggestedUsers: suggestedUsers.length != 0,
                                        suggestedHashtags: suggestedHashtags,
                                        hasSuggestedHashtags: suggestedHashtags.length != 0,
                                        challenges: challenges,
                                        hasChallenges: challenges.length != 0,
                                    });
                                }).catch(fail);
                            }).catch(fail);

                        }).catch(fail);

                    }).catch(fail);

                });
            }).catch(fail);
        });
        this.router.get('/explore', (req, res) =>
        {
            let fail = (err) =>
            {
                this.show500(req, res, err);
            };
            loadSocialPosts(siteModules, req.session.currentUser, { limit: 11 }).then((posts) =>
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
                        posts[index]._hasComments = comments.length != 0;
                        posts[index]._comments = comments;
                        loadPostComments(index + 1, finish);
                    }).catch(fail);
                };
                loadPostComments(0, () =>
                {
                    let firstPosts = [];
                    let otherPosts = [];
                    for (var i = 0; i < posts.length; i++)
                    {
                        if (i < 5)
                            firstPosts.push(posts[i]);
                        else
                            otherPosts.push(posts[i]);
                    }
                    this.renderTemplate(req, res, 'social/social-explore.html', {
                        firstPosts,
                        otherPosts,

                    });
                });
            }).catch(fail);
        });
        this.router.post('/load-posts', (req, res) =>
        {
            var limit = req.body.limit ? req.body.limit : 9;
            var offset = req.body.offset ? req.body.offset : 0;
            var query = req.body;
            if (query == 'explore')
                query = {};
            else if (query == 'feed')
            {
                query = {};
            }
            query.limit = limit;
            query.offset = offset;
            let fail = (err) =>
            {
                res.send({ code: 500, error: err });
            };
            loadSocialPosts(siteModules, req.session.currentUser, query).then((posts) =>
            {
                if (req.body.noComments)
                {
                    res.send({ code: 200, _data: posts });
                    return;
                }
                const loadPostComments = function (index, finish)
                {
                    if (index >= posts.length)
                    {
                        finish();
                        return;
                    }
                    loadComments(siteModules, req.session.currentUser, { objectType: 'social-posts', objectId: posts[index]._id, limit: 6 }).then((comments) =>
                    {
                        posts[index]._hasComments = comments.length != 0;
                        posts[index]._comments = comments;
                        loadPostComments(index + 1, finish);
                    }).catch(fail);
                };
                loadPostComments(0, () =>
                {
                    res.send({ code: 200, _data: posts });
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
        this.router.get('/welcome', (req, res) =>
        {
            let fail = (err) =>
            {
                this.show500(req, res, err);
            };
            siteModules.SocialHashtag.find({}).then((hashTags) =>
            {
                this.renderTemplate(req, res, 'social/social-follow-hashtags.html', {
                    hashTags
                });
            }).catch(fail);
        });
        this.router.post('/welcome-submit', (req, res) =>
        {
            let fail = (err) =>
            {
                this.show500(req, res, err);
            };
            // console.log(req.body.tags);
            let tags = JSON.parse(req.body.tags);
            let followTag = (index, finish) =>
            {
                if (index >= tags.length)
                {
                    finish();
                    return;
                }
                siteModules.User.apiCall('set-follow-hashtag', {
                    userId: req.session.currentUser._id,
                    userToken: req.session.currentUser.token,
                    tagId: tags[index],
                    follow: true
                }).then((user) =>
                {
                    req.session.currentUser = user;
                    req.session.save(() =>
                    {
                        followTag(index + 1, finish);
                    });
                }).catch(fail);
            };
            followTag(0, () =>
            {
                res.redirect('/social');
            });
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
    post._isBookmarked = false;
    if (currentUser.social.bookmarks == undefined)
        currentUser.social.bookmarks = [];
    for (var i = 0; i < currentUser.social.bookmarks.length; i++)
    {
        if (currentUser.social.bookmarks[i] == post._id)
        {
            post._isBookmarked = true;
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