import { SocketRouter } from "./socket_router";
import APIRouter from "./api_router";
import { isEmptyString, moment_now } from "../utils/utils";

class BuildsExtraSocketRouter extends SocketRouter
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
        if (request.model != 'builds')
            return;
        if (request.method == 'vote')
        {
            this.handler.vote(request.params).then((build) =>
            {
                this.sendResponse(socket, request, build);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
        if (request.method == 'increase-view')
        {
            this.handler.increaseView(request.params._id).then((build) =>
            {
                this.sendResponse(socket, request, { success: true, buildId: build._id, views: build.views });
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
    }
}
class BuildsExtraHttpRouter extends APIRouter
{
    constructor(handler)
    {
        super();
        this.handler = handler;
        this.router.post('/vote', (req, res) =>
        {
            this.handler.vote(req.body).then((build) =>
            {
                this.sendResponse(req, res, build);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            })
        });
        this.router.get('/:_id/increase-view', (req, res) =>
        {
            this.handler.increaseView(req.params._id).then((build) =>
            {
                this.sendResponse(req, res, { success: true, buildId: build._id, views: build.views });
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            })
        });
    }
}
export class BuildsExtraHandler
{
    constructor(Build)
    {
        this.Build = Build;
        //routers:
        this.httpRouter = new BuildsExtraHttpRouter(this);
        this.socketRouter = new BuildsExtraSocketRouter(this);
        //bind functions:
        this.vote = this.vote.bind(this);
        this.increaseView = this.increaseView.bind(this);
    }
    vote(params)
    {
        return new Promise((resolve, reject) =>
        {
            if (isEmptyString(params.buildId))
            {
                reject('missing parameter buildId');
                return;
            }
            if (isEmptyString(params.userId))
            {
                reject('missing parameter userId');
                return;
            }
            this.Build.findOne({ _id: params.buildId }).exec((err, build) =>
            {
                if (err)
                {
                    reject(err.toString());
                    return;
                }
                console.log(params.vote);
                if (params.vote == 'up')
                {
                    for (var i = 0; i < build.upVotes.length; i++)
                    {
                        if (build.upVotes[i] == params.userId)
                        {
                            reject('already voted for this build');
                            return;
                        }
                    }
                    build.upVotes.push(params.userId);
                    for (var i = 0; i < build.downVotes.length; i++)
                    {
                        if (build.downVotes[i] == params.userId)
                        {
                            build.downVotes.splice(i, 1);
                            break;
                        }
                    }
                }
                else if (params.vote == 'down')
                {
                    for (var i = 0; i < build.downVotes.length; i++)
                    {
                        if (build.downVotes[i] == params.userId)
                        {
                            reject('already voted for this build');
                            return;
                        }
                    }
                    build.downVotes.push(params.userId);
                    for (var i = 0; i < build.upVotes.length; i++)
                    {
                        if (build.upVotes[i] == params.userId)
                        {
                            build.upVotes.splice(i, 1);
                            break;
                        }
                    }
                }
                this.Build.findByIdAndUpdate(build._id, { $set: { upVotes: build.upVotes, downVotes: build.downVotes } }, { new: true }, (err, build) =>
                {
                    if (err)
                    {
                        reject(err.toString());
                        return;
                    }
                    resolve(build);
                });
            });
        });
    }
    increaseView(_id)
    {
        return new Promise((resolve, reject) =>
        {
            if (isEmptyString(_id))
            {
                reject('parameter missing _id');
                return;
            }
            this.Build.findByIdAndUpdate(_id, { $inc: { views: 1 } }, { new: true }, (err, build) =>
            {
                if (err)
                {
                    reject(err.toString());
                    return;
                }
                resolve(build);
            });
        });
    }
}
