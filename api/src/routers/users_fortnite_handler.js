import { SocketRouter } from "./socket_router";
import APIRouter from "./api_router";
import { isEmptyString, moment_now } from "../utils/utils";

class FortniteSocketRouter extends SocketRouter
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
        if (request.model != 'users')
            return;
        if (request.method == 'join-fortnite-2019')
        {
            this.handler.joinTournament(request.params).then((user) =>
            {
                this.sendResponse(socket, request, user);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
    }
}
class FortniteHttpRouter extends APIRouter
{
    constructor(handler)
    {
        super();
        this.handler = handler;
        this.router.post('/join-fortnite-2019', (req, res) =>
        {
            let params = {};
            if (req.body.token != undefined)
                params.userToken = req.body.token;
            if (req.body.userToken != undefined)
                params.userToken = req.body.userToken;
            if (req.headers.token != undefined)
                params.userToken = req.headers.token;
            this.handler.joinTournament(params).then((user) =>
            {
                this.sendResponse(req, res, user);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            })
        });
    }
}
export class FortniteTournomentHandler
{
    constructor(User)
    {
        this.User = User;
        //routers:
        this.httpRouter = new FortniteHttpRouter(this);
        this.socketRouter = new FortniteSocketRouter(this);
        //bind functions:
        this.joinTournament = this.joinTournament.bind(this);
    }
    joinTournament(params) //params includes userToken only :))
    {
        return new Promise((resolve, reject) =>
        {
            if (isEmptyString(params.userToken))
            {
                reject('parameter missing userToken');
                return;
            }
            this.User.findOne({ token: params.userToken }).exec((err, user) =>
            {
                if (err)
                {
                    reject(err.toString());
                    return;
                }
                if (user == undefined)
                {
                    reject('invalid token user not found');
                    return;
                }
                if (isEmptyString(user.epicGamesID) && isEmptyString(user.psnID))
                {
                    reject('epicGamesID and psnID are both empty');
                    return;
                }
                user.fortnite2019 = {
                    hasJoined: true,
                    joinedAt: moment_now(),
                };
                this.User.findByIdAndUpdate(user._id, { $set: { fortnite2019: user.fortnite2019 } }, { new: true }, (err, user) =>
                {
                    if (err)
                    {
                        reject(err.toString());
                        return;
                    }
                    if (user == undefined)
                    {
                        reject('sth is wrong user not found');
                        return;
                    }
                    resolve(user);
                });
            });
        });
    }
}
