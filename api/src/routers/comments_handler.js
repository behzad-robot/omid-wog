import APIRouter from "./api_router";
import { SocketRouter } from "./socket_router";
import { isEmptyString, moment_now } from "../utils/utils";
import { JesEncoder } from "../utils/jes-encoder";
import { API_ENCODE_KEY } from "../constants";
const encoder = new JesEncoder(API_ENCODE_KEY);


class CommentsHttpRouter extends APIRouter
{
    constructor(handler)
    {
        super();
        this.handler = handler;
        this.router.post('/new-comment', (req, res) =>
        {
            this.handler.newComment(req.body).then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
        this.router.post('/delete-comment', (req, res) =>
        {
            this.handler.deleteComment(req.body).then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
        this.router.post('/set-like', (req, res) =>
        {
            this.handler.setLike(req.body).then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
    }
}
class CommentsSocketRouter extends SocketRouter
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
        if (request.model != 'comments')
            return;
        //logic comes here:
        if (request.method == 'new-comment')
        {
            this.handler.newComment(request.params).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
        else if (request.method == 'set-like')
        {
            this.handler.setLike(request.params).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
        else if (request.method == 'delete-comment')
        {
            this.handler.deleteComment(request.params).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
    }

}
export class CommentsHandler
{
    constructor(Comment, User)
    {
        this.Comment = Comment;
        this.User = User;
        //routers:
        this.httpRouter = new CommentsHttpRouter(this);
        this.socketRouter = new CommentsSocketRouter(this);
        //bind functions:
        this.newComment = this.newComment.bind(this);
        this.deleteComment = this.deleteComment.bind(this);
        this.setLike = this.setLike.bind(this);

    }
    newComment(params)
    {
        return new Promise((resolve, reject) =>
        {
            if (isEmptyString(params.objectType) || isEmptyString(params.objectId) || isEmptyString(params.userId) || isEmptyString(params.body))
            {
                reject('parameters missing');
                return;
            }
            delete (params._id);
            delete (params.createdAt);
            delete (params.updatedAt);
            params.createdAt = moment_now();
            params.updatedAt = "";
            var doc = new this.Comment(params);
            doc.save().then(() =>
            {
                resolve(doc);
            }).catch((err) =>
            {
                reject(err);
            });
        });
    }
    deleteComment(params)
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
                    reject(err);
                    return;
                }
                if (user.token == params.userToken)
                {
                    reject('invalid token');
                    return;
                }
                this.Comment.findOne({ _id: params._id }).exec((err, comment) =>
                {
                    if (err)
                    {
                        reject(err);
                        return;
                    }
                    if(comment == undefined)
                    {
                        reject('comment not found');
                        return;
                    }
                    if (comment.userId != user._id)
                    {
                        reject('comment is not yours');
                        return;
                    }
                    this.Comment.deleteOne({ _id: params._id }, (err) =>
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

        });
    }
    setLike(params)
    {
        return new Promise((resolve, reject) =>
        {
            if (isEmptyString(params._id) || params.like == undefined || isEmptyString(params.userToken) || isEmptyString(params.userId))
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
                if(user == undefined)
                {
                    reject('user not found');
                    return;
                }
                if (user.token != params.userToken)
                {
                    reject('invalid token');
                    return;
                }
                this.Comment.findOne({ _id: params._id }).exec((err, comment) =>
                {
                    if (err)
                    {
                        reject(err);
                        return;
                    }
                    for (var i = 0; i < comment.likes.length; i++)
                    {
                        if (comment.likes[i] == params.userId)
                        {
                            if (params.like)
                            {
                                resolve(comment);
                                return;
                            }
                            else
                            {
                                comment.likes.splice(i, 1);
                            }
                            break;
                        }
                    }
                    if (params.like)
                        comment.likes.push(params.userId);
                    this.Comment.findByIdAndUpdate(comment._id, { $set: { likes: comment.likes } }, { new: true }, (err, comment) =>
                    {
                        if (err)
                        {
                            reject(err);
                            return;
                        }
                        resolve(comment);
                    });
                });
            });

        });
    }
}