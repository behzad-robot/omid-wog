import APIRouter from "./api_router";
import { SocketRouter } from "./socket_router";
import { isEmptyString, moment_now } from "../utils/utils";
import { JesEncoder } from "../utils/jes-encoder";
import { API_ENCODE_KEY } from "../constants";
const encoder = new JesEncoder(API_ENCODE_KEY);
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
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
        if (request.model != 'social-posts' && request.model != 'social-hashtags')
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
    }

}
export class SocialHandler
{
    constructor(User, SocialPost, SocialHashTag)
    {
        this.User = User;
        this.SocialPost = SocialPost;
        this.SocialHashTag = SocialHashTag;
        //routers:
        this.httpRouter = new SocialHttpRouter(this);
        this.socketRouter = new SocialSocketRouter(this);
        //bind functions:
        this.newSocialPost = this.newSocialPost.bind(this);
        this.editSocialPost = this.editSocialPost.bind(this);
        this.deleteSocialPost = this.deleteSocialPost.bind(this);
        this.setSocialPostLiked = this.setSocialPostLiked.bind(this);
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
                if(params.like)
                    post.likes.push(params.userId);
                this.SocialPost.findByIdAndUpdate(post._id, { $set: { likes: post.likes } }, { new: true }, (err, post) =>
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