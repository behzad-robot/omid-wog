import APIRouter from "./api_router";
import { SocketRouter } from "./socket_router";
import { isEmptyString, moment_now } from "../utils/utils";
import { JesEncoder } from "../utils/jes-encoder";
import { API_ENCODE_KEY } from "../constants";
import moment from 'moment';
const encoder = new JesEncoder(API_ENCODE_KEY);


class CommentsHttpRouter extends APIRouter
{
    constructor(handler)
    {
        super();
        this.handler = handler;
        this.router.get('/new-comment', (req, res) =>
        {
            this.handler.newComment(req.body).then((result) =>
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
    }

}
export class CommentsHandler
{
    constructor(Comment)
    {
        this.Comment = Comment;
        //routers:
        this.httpRouter = new CommentsHttpRouter(this);
        this.socketRouter = new CommentsSocketRouter(this);
        //bind functions:
        this.newComment = this.newComment.bind(this);
    }
    newComment(params)
    {
        if (isEmptyString(params.objectType) || isEmptyString(params.objectId) || isEmptyString(params.userId))
        {
            reject('parameters missing');
            return;
        }
        delete (params._id);
        delete (params.createdAt);
        delete (params.updatedAt);
        params.createdAt = this.now();
        params.updatedAt = "";
        var doc = new this.Comment(params);
        doc.save().then(() =>
        {
            resolve(doc);
        }).catch((err) =>
        {
            reject(err);
        });
    }
    
}