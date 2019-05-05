import { isEmptyString, moment_now } from "../utils/utils";
import { SocketRouter } from "./socket_router";
import APIRouter from "./api_router";
const INIT_COINS = 40;
const VALID_ACTIONS = [
    { active: true, token: 'matchup_tashtak_vs_monster', reward: -1, isBet: true, maxCoins: 100, answer: undefined, options: ['tashtak_sazan', 'monster_gaming'] },
    { active: true, token: 'follow_instagram', reward: 10 },
];
function getAction(token)
{
    for (var i = 0; i < VALID_ACTIONS.length; i++)
        if (VALID_ACTIONS[i].token == token)
            return VALID_ACTIONS[i];
    return undefined;
}
function getRewardForAction(token)
{
    for (var i = 0; i < VALID_ACTIONS.length; i++)
    {
        if (token == VALID_ACTIONS[i].token)
            return VALID_ACTIONS[i].reward;
    }
    return 0;
}
class Dota2BookHttpRouter extends APIRouter
{
    constructor(handler)
    {
        super();
        this.handler = handler;
        this.router.post('/do-payment', (req, res) =>
        {
            this.handleError(req, res, 'HTTP not allowed');
        });
        this.router.post('/add-action', (req, res) =>
        {
            this.handleError(req, res, 'HTTP not allowed');
        });
        this.router.post('/add-bet', (req, res) =>
        {
            this.handleError(req, res, 'HTTP not allowed');
        });
        this.router.all('/update-all-bets', (req, res) =>
        {
            this.handleError(req, res, 'HTTP not allowed');
        });
    }
}
class Dota2BookSocketRouter extends SocketRouter
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
        if (request.method == 'dota2-book-do-payment')
        {
            this.handler.doPayment(request.params).then((user) =>
            {
                this.sendResponse(socket, request, user);
            }).catch((err) =>
            {
                this.handleError(socket, request, err.toString());
            });
        }
        else if (request.method == 'dota2-book-add-action')
        {
            this.handler.addAction(request.params).then((user) =>
            {
                this.sendResponse(socket, request, user);
            }).catch((err) =>
            {
                this.handleError(socket, request, err.toString());
            });
        }
        else if (request.method == 'dota2-book-add-bet')
        {
            this.handler.addBet(request.params).then((user) =>
            {
                this.sendResponse(socket, request, user);
            }).catch((err) =>
            {
                this.handleError(socket, request, err.toString());
            });
        }
    }
}
export class DotaBookHandler 
{
    constructor(User)
    {
        this.User = User;
        //routers:
        this.httpRouter = new Dota2BookHttpRouter(this);
        this.socketRouter = new Dota2BookSocketRouter(this);
        //bind functions:
        this.checkAndFixUser = this.checkAndFixUser.bind(this);
        this.doPayment = this.doPayment.bind(this);
        this.addAction = this.addAction.bind(this);
    }
    checkAndFixUser(user)
    {
        if (user.dota2Book2019 == undefined)
        {
            user.dota2Book2019 = {
                initPayment: false,
                initPaymentToken: "",
                initPaymentDate: "",
                coins: 0,
                actions: [], // { token : string , reward : int , createdAt : string }
                bets: [], // { token : string , value : int , status : string , createdAt : string } // status : pending , win , loose
            };
        }
        return user;
    }
    doPayment(params) // params is : { _id : string initPaymentToken : string , userToken : string (user.token )}
    {
        return new Promise((resolve, reject) =>
        {
            if (isEmptyString(params.initPaymentToken))
            {
                reject('missing parameter initPaymentToken');
                return;
            }
            if (isEmptyString(params.userToken))
            {
                reject('missing parameter userToken');
                return;
            }
            if (isEmptyString(params._id))
            {
                reject('missing parameter _id');
                return;
            }
            let player = this.checkAndFixUser({ _id: params._id });
            delete (params._id);
            this.User.findOne({ _id: player._id }).exec((err, result) =>
            {
                if (err)
                {
                    reject(err.toString());
                    return;
                }
                if (result.token != params.userToken)
                {
                    reject('invalid token! access denied.');
                    return;
                }
                if (result.initPayment)
                {
                    reject('user has already payed.');
                    return;
                }
                player.dota2Book2019.initPayment = true;
                player.dota2Book2019.initPaymentToken = params.initPaymentToken;
                player.dota2Book2019.initPaymentDate = moment_now();
                player.dota2Book2019.coins = INIT_COINS;
                player.dota2Book2019.actions.push({ token: 'init_payment', reward: INIT_COINS, createdAt: moment_now() });
                this.User.findByIdAndUpdate(player._id, { $set: { dota2Book2019: player.dota2Book2019 } }, { new: true }, (err, user) =>
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
    addAction(params) // params is : { _id : string , token : string , userToken : string (user.token )}
    {
        return new Promise((resolve, reject) =>
        {
            //check user required params:
            if (isEmptyString(params.userToken))
            {
                reject('missing parameter userToken');
                return;
            }
            if (isEmptyString(params._id))
            {
                reject('missing parameter _id');
                return;
            }
            //check required params:
            if (isEmptyString(params.token))
            {
                reject('missing parameter token');
                return;
            }
            //check if token is valid
            let action = getAction(params.action);
            if (action == undefined)
            {
                reject('invalid action token');
                return;
            }
            if (!action.active)
            {
                reject('expired action token');
                return;
            }
            //load related player:
            this.User.findOne({ _id: params._id }).exec((err, player) =>
            {
                if (err)
                {
                    reject(err.toString());
                    return;
                }
                if (player.token != params.userToken)
                {
                    reject('invalid token! access denied.');
                    return;
                }
                if (player.dota2Book2019 == undefined || !player.dota2Book2019.initPayment)
                {
                    reject('payment not done');
                    return;
                }
                for (var i = 0; i < player.dota2Book2019.actions.length; i++)
                {
                    if (player.dota2Book2019.actions[i].token == params.token)
                    {
                        reject('action already done');
                        return;
                    }
                }
                let reward = getRewardForAction(params.token);
                player.dota2Book2019.actions.push({ token: params.token, reward: reward, createdAt: moment_now() });
                if (reward > 0)
                    player.dota2Book2019.coins += reward;
                this.User.findByIdAndUpdate(player._id, { $set: { dota2Book2019: player.dota2Book2019 } }, { new: true }, (err, user) =>
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
    addBet(params) // params is : { _id : string , token : string ,betCoins : int , userToken : string (user.token )}
    {
        return new Promise((resolve, reject) =>
        {
            //check user required params:
            if (isEmptyString(params.userToken))
            {
                reject('missing parameter userToken');
                return;
            }
            if (isEmptyString(params._id))
            {
                reject('missing parameter _id');
                return;
            }
            //check required params:
            if (isEmptyString(params.token))
            {
                reject('missing parameter token');
                return;
            }
            if (params.betCoins == undefined || isEmptyString(params.betCoins.toString()))
            {
                reject('missing parameter betCoins');
                return;
            }
            if (params.value == undefined || isEmptyString(params.value.toString()))
            {
                reject('missing parameter value');
                return;
            }
            //check if token is valid
            let bet = getAction(params.token);
            if (bet == undefined)
            {
                reject('invalid bet token');
                return;
            }
            if (!bet.active)
            {
                reject('inactive bet token');
                return;
            }
            if (params.betCoins > bet.maxCoins)
            {
                reject('betCoins is more than max coins allowed');
                return;
            }
            //load related player:
            this.User.findOne({ _id: params._id }).exec((err, player) =>
            {
                if (err)
                {
                    reject(err);
                    return;
                }
                console.log('we have reached state of bet checking!');
                for (var i = 0; i < player.dota2Book2019.bets.length; i++)
                {
                    if (player.dota2Book2019.bets[i].token == params.token)
                    {
                        reject('bet already done');
                        return;
                    }
                }
                if (player.dota2Book2019.coins < params.betCoins)
                {
                    reject('not enough coins');
                    return;
                }
                player.dota2Book2019.coins -= params.betCoins;
                player.dota2Book2019.bets.push({ token: params.token, value: params.value, coins: params.betCoins, status: "pending", createdAt: moment_now() });
                this.User.findByIdAndUpdate(player._id, { $set: { dota2Book2019: player.dota2Book2019 } }, { new: true }, (err, user) =>
                {
                    if (err)
                    {
                        reject(err.toString());
                        return;
                    }
                    resolve(user);
                });
            });
        });
    }
    updateAllBets()
    {
        return new Promise((resolve, reject) =>
        {
            this.User.find({}, (err, users) =>
            {
                if (err)
                {
                    reject(err.toString());
                    return;
                }
                let editUser = function (index, finish)
                {

                };
            });
        });
    }
}