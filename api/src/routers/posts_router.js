import APIRouter from "./api_router";
import { SocketRouter } from "./socket_router";
import { isEmptyString, moment_now } from "../utils/utils";
import { JesEncoder } from "../utils/jes-encoder";
import { API_ENCODE_KEY } from "../constants";
import moment from 'moment';
const encoder = new JesEncoder(API_ENCODE_KEY);


class PostsHttpRouter extends APIRouter
{
    constructor(handler)
    {
        super();
        this.handler = handler;
        this.router.get('/search', (req, res) =>
        {
            this.handler.search(req.query.s).then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
    }
}
class PostsSocketRouter extends SocketRouter
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
        if (request.model != 'posts')
            return;
        //logic comes here:
        if (request.method == 'search')
        {
            this.handler.search(request.params.s).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
    }

}
export class PostsHandler
{
    constructor(Post)
    {
        this.Post = Post;
        //routers:
        this.httpRouter = new PostsHttpRouter(this);
        this.socketRouter = new PostsSocketRouter(this);
        //bind functions:
        this.search = this.search.bind(this);
    }
    search(searchQuery, limit = 20, offset = 0)
    {
        return new Promise((resolve, reject) =>
        {
            if (isEmptyString(searchQuery))
            {
                reject('search query cant be empty');
                return;
            }
            var regex = { '$regex': searchQuery, '$options': 'i' };
            this.Post.find({
                '$or': [
                    { title: regex },
                    { intro: regex },
                    { body: regex },
                    { tags: searchQuery }
                ]
            }).limit(limit).skip(offset).exec((err, results) =>
            {
                if (err)
                {
                    reject(err.toString());
                    return;
                }
                for (var i = 0; i < results.length; i++)
                    results[i] = this.Post.Helpers.public(results[i]);
                resolve(results);
            });
        });
    }
    
}