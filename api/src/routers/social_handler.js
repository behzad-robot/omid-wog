import APIRouter from "./api_router";
import { SocketRouter } from "./socket_router";
import { isEmptyString, moment_now, isVideo } from "../utils/utils";
import { JesEncoder } from "../utils/jes-encoder";
import { API_ENCODE_KEY } from "../constants";
const encoder = new JesEncoder(API_ENCODE_KEY);
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
import ThumbnailGenerator from 'video-thumbnail-generator';


const SOCIAL_MEDIA_FOLDER = path.resolve('../storage/social-posts/');

class SocialHttpRouter extends APIRouter
{
    constructor(handler)
    {
        super();
        this.handler = handler;
        this.router.post('/new-social-post', (req, res) =>
        {
            this.handler.newSocialPost(req.body).then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
        this.router.post('/edit-social-post', (req, res) =>
        {
            this.handler.editSocialPost(req.body).then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
        this.router.post('/delete-social-post', (req, res) =>
        {
            this.handler.deleteSocialPost(req.body).then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
        this.router.post('/set-like-social-post', (req, res) =>
        {
            this.handler.setSocialPostLiked(req.body).then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
        this.router.post('/set-follow-user', (req, res) =>
        {
            this.handler.setFollowUser(req.body).then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
        this.router.post('/set-follow-hashtag', (req, res) =>
        {
            this.handler.setFollowHashtag(req.body).then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
        this.router.post('/set-bookmark', (req, res) =>
        {
            this.handler.setBookmark(req.body).then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
        this.router.post('/enter-challenge', (req, res) =>
        {
            this.handler.enterChallenge(req.body).then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
        this.router.post('/read-notifications', (req, res) =>
        {
            this.handler.readNotifications(req.body).then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
        this.router.post('/get-unread-notifications', (req, res) =>
        {
            this.handler.getUnreadNotifications(req.body).then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
        this.router.post('/upload-file', (req, res) =>
        {
            this.handleFile(req, res, 'media', 'social-posts/draft/').then((file) =>
            {
                res.send({ code: 200, file: file });
            }).catch((err) =>
            {
                res.send({ code: 500, error: err.toString() });
            });
        });
    }
}
class SocialSocketRouter extends SocketRouter
{
    constructor(handler)
    {
        super();
        this.handler = handler;
        this.onMessage = this.onMessage.bind(this);
    }
    onMessage(socket, request)
    {
        if (!this.isValidRequest(request))
            return;
        if (request.model != 'social-posts' && request.model != 'social-hashtags' && request.model != 'social-challenges'
            && request.model != 'users' && request.model != 'social-notifications')
            return;
        //logic comes here:
        if (request.method == 'new-social-post')
        {
            this.handler.newSocialPost(request.params).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
        else if (request.method == 'edit-social-post')
        {
            this.handler.editSocialPost(request.params).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
        else if (request.method == 'delete-social-post')
        {
            this.handler.deleteSocialPost(request.params).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
        else if (request.method == 'set-like-social-post')
        {
            this.handler.setSocialPostLiked(request.params).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
        else if (request.method == 'set-follow-user')
        {
            this.handler.setFollowUser(request.params).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
        else if (request.method == 'set-follow-hashtag')
        {
            this.handler.setFollowHashtag(request.params).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
        else if (request.method == 'set-bookmark')
        {
            this.handler.setBookmark(request.params).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
        else if (request.method == 'enter-challenge')
        {
            this.handler.enterChallenge(request.params).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
        else if (request.method == 'read-notifications')
        {
            this.handler.readNotifications(request.params).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
        else if (request.method == 'get-unread-notifications')
        {
            this.handler.getUnreadNotifications(request.params).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
    }

}
export class SocialHandler
{
    constructor(User, SocialPost, SocialHashTag, SocialChallenge, SocialNotification)
    {
        this.User = User;
        this.SocialPost = SocialPost;
        this.SocialHashTag = SocialHashTag;
        this.SocialChallenge = SocialChallenge;
        this.SocialNotification = SocialNotification;
        //routers:
        this.httpRouter = new SocialHttpRouter(this);
        this.socketRouter = new SocialSocketRouter(this);
        //bind functions:
        this.newSocialPost = this.newSocialPost.bind(this);
        this.editSocialPost = this.editSocialPost.bind(this);
        this.deleteSocialPost = this.deleteSocialPost.bind(this);
        this.setSocialPostLiked = this.setSocialPostLiked.bind(this);
        this.setFollowUser = this.setFollowUser.bind(this);
        this.setFollowHashtag = this.setFollowHashtag.bind(this);
        this.setBookmark = this.setBookmark.bind(this);
        this.enterChallenge = this.enterChallenge.bind(this);
        this.getUnreadNotifications = this.getUnreadNotifications.bind(this);
        this.readNotifications = this.readNotifications.bind(this);
    }
    newSocialPost(params) //{ userId , userToken , body , media}
    {
        return new Promise((resolve, reject) =>
        {
            if (isEmptyString(params.userToken) || isEmptyString(params.userId) || params.body == undefined || params.media == undefined || params.media.length == 0)
            {
                reject('parameters missing');
                return;
            }
            this.User.findOne({ _id: params.userId }).exec((err, user) =>
            {
                if (err)
                {
                    reject(err.toString());
                    return;
                }
                if (user == undefined)
                {
                    reject('user not found');
                    return;
                }
                if (user.token != params.userToken)
                {
                    reject('invalid token');
                    return;
                }
                let bodyTags = [];
                let gameId = undefined;
                let bodyLower = params.body.toLowerCase();
                bodyTags = bodyLower.match(/#[a-z]+/gi);
                if (bodyTags == undefined)
                    bodyTags = [];
                this.SocialHashTag.find({}).limit(10000).exec((err, hashTags) =>
                {
                    if (err)
                    {
                        reject(err.toString());
                        return;
                    }
                    //look for gameId:
                    let gameId = undefined;
                    for (var i = 0; i < hashTags.length; i++)
                    {
                        for (var j = 0; j < bodyTags.length; j++)
                        {
                            if (hasTag(hashTags[i], bodyTags[j]))
                            {
                                gameId = hashTags[i].gameId;
                                break;
                            }
                        }
                    }
                    let data = { userId: user._id, body: params.body, gameId: gameId ? gameId : '', tags: bodyTags, media: params.media, _draft: false, createdAt: moment_now(), updatedAt: '' };
                    console.log(SOCIAL_MEDIA_FOLDER);
                    let post = new this.SocialPost(data);
                    post.save(() =>
                    {
                        fs.mkdirSync(SOCIAL_MEDIA_FOLDER + '/' + post._id);
                        try
                        {
                            for (var i = 0; i < post.media.length; i++)
                            {
                                let m = '..' + post.media[i];
                                let newDir = m.replace('draft', post._id);
                                fs.copyFileSync(m, newDir);
                                console.log(m);
                                fs.unlinkSync(m);
                                post.media[i] = newDir.replace('../', '/');
                            }
                            if (!isVideo(post.media[0]))
                            {
                                const fileFormat = post.media[0].substring(post.media[0].lastIndexOf('.'), post.media[0].length);
                                let resized150x150 = post.media[0].replace(fileFormat, '-resize-150x150' + fileFormat);
                                let resized512x512 = post.media[0].replace(fileFormat, '-resize-512x512' + fileFormat);
                                Jimp.read('..' + post.media[0], (err, img) =>
                                {
                                    if (err)
                                        console.log(err);
                                    img
                                        .cover(150, 150)
                                        .quality(60)
                                        .write('..' + resized150x150);
                                    console.log(resized150x150);
                                });
                                Jimp.read('..' + post.media[0], (err, img) =>
                                {
                                    if (err)
                                        console.log(err);
                                    img
                                        .cover(512, 512)
                                        .quality(60)
                                        .write('..' + resized512x512);
                                    console.log(resized512x512);
                                });
                            }
                            else
                            {
                                const tg = new ThumbnailGenerator({
                                    sourcePath: path.resolve('../' + post.media[0]),
                                    thumbnailPath: path.resolve('../storage/social-posts/' + post._id + '/'),
                                });
                                tg.generateOneByPercent(90).then((result) =>
                                {
                                    console.log('generated thumbnail for video=' + result);
                                });
                            }
                        } catch (err)
                        {
                            console.log(err.toString());
                        }
                        this.SocialPost.findByIdAndUpdate(post._id, { $set: { media: post.media } }, { new: true }, (err, post) =>
                        {
                            if (err)
                            {
                                reject(err.toString());
                                return;
                            }
                            resolve(post);
                        });
                    });
                });

            });
        });
    }
    editSocialPost(params) //{userToken , userId , _id , body}
    {
        return new Promise((resolve, reject) =>
        {
            if (isEmptyString(params._id) || isEmptyString(params.userToken) || isEmptyString(params.userId) || params.body == undefined)
            {
                reject('parameters missing');
                return;
            }
            this.User.findOne({ _id: params.userId }).exec((err, user) =>
            {
                if (err)
                {
                    reject(err.toString());
                    return;
                }
                if (user == undefined)
                {
                    reject('user not found');
                    return;
                }
                if (user.token != params.userToken)
                {
                    reject('invalid token');
                    return;
                }
                let bodyLower = params.body.toLowerCase();
                let bodyTags = bodyLower.match(/#[a-z]+/gi);
                if (bodyTags == undefined)
                    bodyTags = [];
                this.SocialHashTag.find({}).limit(10000).exec((err, hashTags) =>
                {
                    if (err)
                    {
                        reject(err.toString());
                        return;
                    }
                    //look for gameId:
                    let gameId = '';
                    for (var i = 0; i < hashTags.length; i++)
                    {
                        for (var j = 0; j < bodyTags.length; j++)
                        {
                            if (hasTag(hashTags[i], bodyTags[j]))
                            {
                                gameId = hashTags[i].gameId;
                                break;
                            }
                        }
                    }
                    this.SocialPost.findByIdAndUpdate(params._id, { $set: { body: params.body, tags: bodyTags, gameId: gameId, updatedAt: moment_now() } }, { new: true }, (err, post) =>
                    {
                        if (err)
                        {
                            reject(err.toString());
                            return;
                        }
                        resolve(post);
                    });
                });
            });
        });
    }
    deleteSocialPost(params) //{userToken , userId , _id }
    {
        return new Promise((resolve, reject) =>
        {
            if (isEmptyString(params._id) || isEmptyString(params.userToken) || isEmptyString(params.userId))
            {
                reject('parameters missing');
                return;
            }
            this.User.findOne({ _id: params.userId }).exec((err, user) =>
            {
                if (err)
                {
                    reject(err.toString());
                    return;
                }
                if (user == undefined)
                {
                    reject('user not found');
                    return;
                }
                if (user.token != params.userToken)
                {
                    reject('invalid token');
                    return;
                }
                this.SocialPost.deleteOne({ _id: params._id }, (err) =>
                {
                    if (err)
                    {
                        reject(err.toString());
                        return;
                    }
                    resolve({ success: true, _id: params._id });
                });
            });
        });
    }
    setSocialPostLiked(params) //{userId , userToken , _id , like : boolean}
    {
        return new Promise((resolve, reject) =>
        {
            if (isEmptyString(params.userId) || isEmptyString(params.userToken) || isEmptyString(params._id) || params.like == undefined)
            {
                reject('parameters missing');
                return;
            }
            this.SocialPost.findOne({ _id: params._id }).exec((err, post) =>
            {
                if (err)
                {
                    reject(err.toString());
                    return;
                }
                if (post == undefined)
                {
                    reject('post not found');
                    return;
                }
                for (var i = 0; i < post.likes.length; i++)
                {
                    if (post.likes[i] == params.userId)
                    {
                        if (params.like)
                        {
                            resolve(post);
                            return;
                        }
                        else
                        {
                            post.likes.splice(i, 1);
                        }
                        break;
                    }
                }
                if (params.like)
                    post.likes.push(params.userId);
                this.SocialPost.findByIdAndUpdate(post._id, { $set: { likes: post.likes } }, { new: true }, (err, post) =>
                {
                    if (err)
                    {
                        reject(err.toString());
                        return;
                    }
                    if (params.like)
                    {
                        if (post.userId != params.userId)
                        {
                            var notification = new this.SocialNotification({
                                actionUserId: params.userId,
                                targetUserId: post.userId,
                                postId: post._id.toString(),
                                type: 'like-post',
                                createdAt: moment_now(),
                            });
                            notification.save(() =>
                            {
                                resolve(post);
                            });
                        }
                        else
                            resolve(post);
                    }
                    else
                    {
                        //delete if not read:
                        this.SocialNotification.deleteOne({
                            postId: post._id.toString(),
                            type: 'like-post',
                            actionUserId: params.userId,
                            read: false,
                        }, (err) =>
                            {
                                if (err)
                                {
                                    console.log('error removing notification =>' + err.toString());
                                }
                                resolve(post);
                            });
                    }
                });
            });
        });
    }
    setFollowUser(params) //{userToken , userId , target , follow }
    {
        return new Promise((resolve, reject) =>
        {
            if (isEmptyString(params.userToken) || isEmptyString(params.userId) || isEmptyString(params.target) || params.follow == undefined)
            {
                reject('parameters missing');
                return;
            }
            this.User.findOne({ _id: params.userId }).exec((err, currentUser) =>
            {
                if (err)
                {
                    reject(err);
                    return;
                }
                if (currentUser == undefined)
                {
                    reject('currentUser not found');
                    return;
                }
                if (currentUser.token != params.userToken)
                {
                    reject('invalid token');
                    return;
                }
                if (currentUser._id.toString() == params.target)
                {
                    reject('cant follow yourself');
                    return;
                }
                //check already following:
                for (var i = 0; i < currentUser.social.followings.length; i++)
                {
                    if (currentUser.social.followings[i] == params.target)
                    {
                        if (params.follow)
                        {
                            resolve(currentUser);
                            return;
                        }
                        else
                        {
                            currentUser.social.followings.splice(i, 1);
                        }
                        break;
                    }
                }
                //add to followings:
                if (params.follow)
                    currentUser.social.followings.push(params.target);
                //get target user:
                this.User.findOne({ _id: params.target }).exec((err, targetUser) =>
                {
                    if (err)
                    {
                        reject(err);
                        return;
                    }
                    if (targetUser == undefined)
                    {
                        reject('targetUser not found');
                        return;
                    }
                    let has = false;
                    for (var i = 0; i < targetUser.social.followers.length; i++)
                    {
                        if (targetUser.social.followers[i] == currentUser._id.toString())
                        {
                            if (!params.follow)
                            {
                                targetUser.social.followers.splice(i, 1);
                            }
                            has = true;
                            break;
                        }
                    }
                    //add to followers:
                    if (!has && params.follow)
                        targetUser.social.followers.push(currentUser._id.toString());
                    //update both users:
                    this.User.findByIdAndUpdate(currentUser._id, { $set: { social: currentUser.social } }, { new: true }, (err, currentUser) =>
                    {
                        if (err)
                        {
                            reject(err);
                            return;
                        }
                        this.User.findByIdAndUpdate(targetUser._id, { $set: { social: targetUser.social } }, { new: true }, (err, targetUser) =>
                        {
                            if (err)
                            {
                                reject(err);
                                return;
                            }
                            if (params.follow)
                            {
                                var notification = new this.SocialNotification({
                                    actionUserId: currentUser._id.toString(),
                                    targetUserId: targetUser._id.toString(),
                                    type: 'follow-user',
                                    createdAt: moment_now(),
                                });
                                notification.save(() =>
                                {
                                    resolve(currentUser);
                                });
                            }
                            else
                            {
                                //delete if not read:
                                this.SocialNotification.deleteOne({
                                    actionUserId: currentUser._id.toString(),
                                    targetUser: targetUser._id.toString(),
                                    type: 'follow-user',
                                    read: false,
                                }, (err) =>
                                    {
                                        if (err)
                                        {
                                            console.log('error removing notification =>' + err.toString());
                                        }
                                        resolve(currentUser);
                                    });
                            }
                        });
                    });
                });
            });
        });
    }
    setFollowHashtag(params) //{userToken , userId , tagId , follow : boolean }
    {
        return new Promise((resolve, reject) =>
        {
            if (isEmptyString(params.userId) || isEmptyString(params.userToken) || isEmptyString(params.tagId) || params.follow == undefined)
            {
                reject('parameters missing');
                return;
            }
            this.User.findOne({ _id: params.userId }).exec((err, user) =>
            {
                if (err)
                {
                    reject(err);
                    return;
                }
                if (user == undefined)
                {
                    reject('user not found');
                    return;
                }
                if (user.token != params.userToken)
                {
                    reject('invalid token');
                    return;
                }
                for (var i = 0; i < user.social.followedHashtags.length; i++)
                {
                    if (user.social.followedHashtags[i] == params.userId)
                    {
                        if (params.follow)
                        {
                            resolve(user);
                            return;
                        }
                        else
                        {
                            user.social.followedHashtags.push(params.tagId);
                            break;
                        }
                    }
                }
                if (params.follow)
                    user.social.followedHashtags.push(params.tagId);
                this.User.findByIdAndUpdate(user._id, { $set: { social: user.social } }, { new: true }, (err, user) =>
                {
                    if (err)
                    {
                        reject(err);
                        return;
                    }
                    resolve(user);
                });
            });
        });
    }
    setBookmark(params)
    {
        return new Promise((resolve, reject) =>
        {
            if (isEmptyString(params.userToken) || isEmptyString(params.userId) || isEmptyString(params.postId)
                || params.bookmark == undefined)
            {
                reject('parameters missing');
                return;
            }
            this.User.findOne({ _id: params.userId }).exec((err, user) =>
            {
                if (err)
                {
                    reject(err);
                    return;
                }
                if (user == undefined)
                {
                    reject('user not found');
                    return;
                }
                if (user.token != params.userToken)
                {
                    reject('invalid token');
                    return;
                }
                if (user.social.bookmarks == undefined)
                    user.social.bookmarks = [];
                for (var i = 0; i < user.social.bookmarks.length; i++)
                {
                    if (user.social.bookmarks[i] == params.postId)
                    {
                        if (params.bookmark)
                        {
                            resolve(user);
                            return;
                        }
                        else
                        {
                            user.social.bookmarks.splice(i, 1);
                            break;
                        }
                    }
                }
                if (params.bookmark)
                    user.social.bookmarks.push(params.postId);
                this.User.findByIdAndUpdate(user._id, { $set: { social: user.social } }, { new: true }, (err, user) =>
                {
                    if (err)
                    {
                        reject(err);
                        return;
                    }
                    resolve(user);
                });
            });
        });
    }
    enterChallenge(params) //{userToken , userId , challengeId}
    {
        return new Promise((resolve, reject) =>
        {
            if (isEmptyString(params.userToken) || isEmptyString(params.userId) || isEmptyString(params.challengeId))
            {
                reject('parameters missing');
                return;
            }
            this.User.findOne({ _id: params.userId }).exec((err, currentUser) =>
            {
                if (err)
                {
                    reject(err);
                    return;
                }
                if (currentUser == undefined)
                {
                    reject('user not found');
                    return;
                }
                if (currentUser.token != params.userToken)
                {
                    reject('invalid token');
                    return;
                }
                if (currentUser.social.challenges == undefined)
                    currentUser.social.challenges = [];
                this.SocialChallenge.findOne({ _id: params.challengeId }).exec((err, challenge) =>
                {
                    if (err)
                    {
                        reject(err);
                        return;
                    }
                    if (challenge == undefined)
                    {
                        reject('challenge not found');
                        return;
                    }
                    for (var i = 0; i < currentUser.social.challenges.length; i++)
                    {
                        if (currentUser.social.challenges[i] == params.challengeId)
                        {
                            resolve({ user: currentUser, challenge: challenge });
                            return;
                        }
                    }
                    let hasUser = false;
                    for (var i = 0; i < challenge.users.length; i++)
                    {
                        if (challenge.users[i] == params.userId)
                        {
                            hasUser = true;
                            break;
                        }
                    }
                    if (!hasUser)
                    {
                        if (currentUser.social.coins < challenge.entranceFee)
                        {
                            reject('not enough coins');
                            return;
                        }
                        challenge.users.push(params.userId);
                        currentUser.social.coins -= challenge.entranceFee;
                        currentUser.social.challenges.push(challenge._id);
                    }
                    this.SocialChallenge.findByIdAndUpdate(challenge._id, { $set: { users: challenge.users } }, { new: true }, (err, challenge) =>
                    {
                        if (err)
                        {
                            reject(err);
                            return;
                        }
                        this.User.findByIdAndUpdate(currentUser._id, { $set: { social: currentUser.social } }, { new: true }, (err, currentUser) =>
                        {
                            if (err)
                            {
                                reject(err);
                                return;
                            }
                            resolve({ user: currentUser, challenge: challenge });
                        });
                    });
                });
            });
        });
    }
    getUnreadNotifications(params) //{ userId , userToken}
    {
        return new Promise((resolve, reject) =>
        {
            if (isEmptyString(params.userId) || isEmptyString(params.userToken))
            {
                reject('parameters missing');
                return;
            }
            this.User.findOne({ _id: params.userId }).exec((err, user) =>
            {
                if (err)
                {
                    reject(err);
                    return;
                }
                if (user == undefined)
                {
                    reject('user not found');
                    return;
                }
                if (user.token != params.userToken)
                {
                    reject('invalid token');
                    return;
                }
                this.SocialNotification.find({ read: false, targetUserId: user._id.toString() }).exec((err, notifications) =>
                {
                    if (err)
                    {
                        reject(err);
                        return;
                    }
                    resolve(notifications);
                });
            });
        });
    }
    readNotifications(params) //{ userId , userToken}
    {
        return new Promise((resolve, reject) =>
        {
            if (isEmptyString(params.userId) || isEmptyString(params.userToken))
            {
                reject('parameters missing');
                return;
            }
            this.User.findOne({ _id: params.userId }).exec((err, user) =>
            {
                if (err)
                {
                    reject(err);
                    return;
                }
                if (user == undefined)
                {
                    reject('user not found');
                    return;
                }
                if (user.token != params.userToken)
                {
                    reject('invalid token');
                    return;
                }
                this.SocialNotification.find({ targetUserId: user._id.toString() }).exec((err, notifications) =>
                {
                    if (err)
                    {
                        reject(err);
                        return;
                    }
                    this.SocialNotification.update({ targetUserId: user._id.toString(), read: false }, { "$set": { read: true } }, { "multi": true }, (err, result) =>
                    {
                        if (err)
                        {
                            reject(err);
                            return;
                        }
                        resolve(notifications);
                    });
                });
            });
        });
    }
}
function hasTag(hashTag, targetTag)
{
    let t = targetTag.replace('#', '');
    for (var i = 0; i < hashTag.tags.length; i++)
    {
        if (hashTag.tags[i] == t)
        {
            return true;
        }
    }
    return false;
}