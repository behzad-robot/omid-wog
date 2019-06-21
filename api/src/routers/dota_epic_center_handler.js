import { isEmptyString, moment_now } from "../utils/utils";
import { SocketRouter } from "./socket_router";
import APIRouter from "./api_router";
const fs = require('fs');
const path = require('path');
const TEAMS_FILE_PATH = path.resolve('../storage/epic-center-2019/teams.json');
const VALID_ACTIONS_FILE_PATH = path.resolve('../storage/epic-center-2019/valid-actions.json');

const Instagram = require('instagram-web-api');
const TWITCH_API = require('twitch-api-v5');
TWITCH_API.clientID = '3j5qf1r09286hluj7rv4abqkbqosk3';

const INIT_COINS = 300;
const FOLLOW_TWITCH = 'follow_twitch';
function getAction(VALID_ACTIONS, token)
{

    for (var i = 0; i < VALID_ACTIONS.length; i++)
    {
        if (VALID_ACTIONS[i].token == token)
            return VALID_ACTIONS[i];
    }

    return undefined;
}
class DotaEpicCenterHttpRouter extends APIRouter
{
    constructor(handler)
    {
        super();
        this.handler = handler;
        this.router.get('/teams', (req, res) =>
        {
            this.handleError(req, res, 'HTTP not allowed');
        });
        this.router.get('/bets', (req, res) =>
        {
            this.handleError(req, res, 'HTTP not allowed');
        });
        this.router.post('/enter-event', (req, res) =>
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
        this.router.post('/check-instgram-is-followed', (req, res) =>
        {
            this.handleError(req, res, 'HTTP not allowed');
        });
        this.router.post('/check-twitch-is-followed', (req, res) =>
        {
            this.handleError(req, res, 'HTTP not allowed');
        });
        this.router.get('/leaderboard', (req, res) =>
        {
            this.handleError(req, res, 'HTTP not allowed');
        });
    }
}
class DotaEpicCenterSocketRouter extends SocketRouter
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
        if (request.method == 'dota2-epic-center-get-teams')
        {
            this.handler.getTeams().then((user) =>
            {
                this.sendResponse(socket, request, user);
            }).catch((err) =>
            {
                this.handleError(socket, request, err.toString());
            });
        }
        else if (request.method == 'dota2-epic-center-get-actions')
        {
            this.handler.getActions().then((user) =>
            {
                this.sendResponse(socket, request, user);
            }).catch((err) =>
            {
                this.handleError(socket, request, err.toString());
            });
        }
        else if (request.method == 'dota2-epic-center-enter-event')
        {
            console.log('dota2-epic-center enter fucking event!');
            this.handler.enterEvent(request.params).then((user) =>
            {
                this.sendResponse(socket, request, user);
            }).catch((err) =>
            {
                this.handleError(socket, request, err.toString());
            });
        }
        else if (request.method == 'dota2-epic-center-add-action')
        {
            this.handler.addAction(request.params).then((user) =>
            {
                this.sendResponse(socket, request, user);
            }).catch((err) =>
            {
                this.handleError(socket, request, err.toString());
            });
        }
        else if (request.method == 'dota2-epic-center-add-bet')
        {
            this.handler.addBet(request.params).then((user) =>
            {
                this.sendResponse(socket, request, user);
            }).catch((err) =>
            {
                this.handleError(socket, request, err.toString());
            });
        }
        else if (request.method == 'dota2-epic-center-update-all-bets')
        {
            if (request.params['pass-token'] != 'dota2-ride')
            {
                this.handleError(socket, request, 'access denied provide password');
                return;
            }
            this.handler.updateAllBets().then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err.toString());
            });
        }
        else if (request.method == 'dota2-epic-center-leaderboard')
        {
            this.handler.getLeaderboard(request.params._id).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err.toString());
            });
        }
        else if (request.method == 'dota2-epic-center-check-instagram')
        {
            this.handler.checkInstagram(request.params._id).then((user) =>
            {
                this.sendResponse(socket, request, user);
            }).catch((err) =>
            {
                this.handleError(socket, request, err.toString());
            });
        }
        else if (request.method == 'dota2-epic-center-check-twitch')
        {
            this.handler.checkTwitch(request.params).then((user) =>
            {
                this.sendResponse(socket, request, user);
            }).catch((err) =>
            {
                this.handleError(socket, request, err.toString());
            });
        }
    }
}
export class DotaEpicCenterHandler 
{
    constructor(User)
    {
        this.User = User;
        //routers:
        this.httpRouter = new DotaEpicCenterHttpRouter(this);
        this.socketRouter = new DotaEpicCenterSocketRouter(this);
        //bind functions:
        this.getTeams = this.getTeams.bind(this);
        this.getActions = this.getActions.bind(this);
        this.enterEvent = this.enterEvent.bind(this);
        this.addAction = this.addAction.bind(this);
        this.addBet = this.addBet.bind(this);
        this.getLeaderboard = this.getLeaderboard.bind(this);
        this.updateAllBets = this.updateAllBets.bind(this);
        //extra functions:
        this.checkInstagram = this.checkInstagram.bind(this);
        this.checkTwitch = this.checkTwitch.bind(this);

    }
    getTeams()
    {
        return new Promise((resolve, reject) =>
        {
            fs.readFile(TEAMS_FILE_PATH, (err, data) =>
            {
                if (err)
                {
                    reject(err);
                    return;
                }
                resolve(JSON.parse(data.toString()));
            });
        });
    }
    getActions()
    {
        return new Promise((resolve, reject) =>
        {
            fs.readFile(VALID_ACTIONS_FILE_PATH, (err, data) =>
            {
                if (err)
                {
                    reject(err);
                    return;
                }
                resolve(JSON.parse(data.toString()));
            });
        });
    }
    enterEvent(params) // params is : { _id : string , userToken : string (user.token )}
    {
        return new Promise((resolve, reject) =>
        {
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
                if (player.dota2EpicCenter2019.enterEvent)
                {
                    reject('already entered event.');
                    return;
                }
                player.dota2EpicCenter2019.enterEvent = {};
                player.dota2EpicCenter2019.enterEvent = true;
                player.dota2EpicCenter2019.coins = INIT_COINS;
                player.dota2EpicCenter2019.actions = [];
                player.dota2EpicCenter2019.bets = [];
                player.dota2EpicCenter2019.invites = [];
                player.dota2EpicCenter2019.joinedAt = moment_now();
                this.User.findByIdAndUpdate(player._id, { $set: { dota2EpicCenter2019: player.dota2EpicCenter2019 } }, { new: true }, (err, user) =>
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
        return new Promise(async (resolve, reject) =>
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
            console.log(params.token);
            const VALID_ACTIONS = await this.getActions();
            console.log(VALID_ACTIONS);
            let action = getAction(VALID_ACTIONS, params.token);
            console.log(action);
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
                // if (player.dota2EpicCenter2019 == undefined || !player.dota2EpicCenter2019.initPayment)
                // {
                //     reject('payment not done');
                //     return;
                // }
                for (var i = 0; i < player.dota2EpicCenter2019.actions.length; i++)
                {
                    if (player.dota2EpicCenter2019.actions[i].token == params.token)
                    {
                        reject('action already done');
                        return;
                    }
                }
                let reward = action.reward;
                player.dota2EpicCenter2019.actions.push({ token: params.token, reward: reward, createdAt: moment_now() });
                if (reward > 0)
                    player.dota2EpicCenter2019.coins += reward;
                this.User.findByIdAndUpdate(player._id, { $set: { dota2EpicCenter2019: player.dota2EpicCenter2019 } }, { new: true }, (err, user) =>
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
        return new Promise(async (resolve, reject)  =>
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
            const VALID_ACTIONS = await this.getActions();
            console.log(VALID_ACTIONS);
            console.log(params.token);
            let bet = getAction(VALID_ACTIONS, params.token);
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
                for (var i = 0; i < player.dota2EpicCenter2019.bets.length; i++)
                {
                    if (player.dota2EpicCenter2019.bets[i].token == params.token)
                    {
                        reject('bet already done');
                        return;
                    }
                }
                if (player.dota2EpicCenter2019.coins < params.betCoins)
                {
                    reject('not enough coins');
                    return;
                }
                player.dota2EpicCenter2019.coins -= params.betCoins;
                player.dota2EpicCenter2019.bets.push({ token: params.token, value: params.value, coins: params.betCoins, status: "pending", createdAt: moment_now() });
                this.User.findByIdAndUpdate(player._id, { $set: { dota2EpicCenter2019: player.dota2EpicCenter2019 } }, { new: true }, (err, user) =>
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
            this.User.find({ 'dota2EpicCenter2019.enterEvent': true }).limit(20000).exec((err, users) =>
            {
                console.log('Users of event=>' + users.length);
                if (err)
                {
                    reject(err.toString());
                    return;
                }
                let usersAffected = 0;
                const validActionsFromFile = JSON.parse(fs.readFileSync(VALID_ACTIONS_FILE_PATH).toString());
                console.log('actions from file=' + validActionsFromFile.length);
                let getBetFromFile = (token) =>
                {
                    for (var i = 0; i < validActionsFromFile.length; i++)
                    {
                        if (validActionsFromFile[i].token == token)
                            return validActionsFromFile[i];
                    }
                    return undefined;
                };
                let editUser = (index, finish) =>
                {
                    if (index >= users.length)
                    {
                        finish();
                        return;
                    }
                    let u = users[index];
                    let minCoins = 300;
                    for (var i = 0; i < u.dota2EpicCenter2019.actions.length; i++)
                    {
                        if (u.dota2EpicCenter2019.actions[i].token == FOLLOW_TWITCH)
                        {
                            minCoins = 600;
                            break;
                        }
                    }
                    for (var i = 0; i < u.dota2EpicCenter2019.bets.length; i++)
                    {
                        let userBet = u.dota2EpicCenter2019.bets[i];
                        if (userBet.status == 'pending')
                        {
                            let bet = getBetFromFile(userBet.token);
                            if (bet == undefined)
                            {
                                console.log(userBet.token + ' bet not found!');
                                continue;
                            }
                            if (!isEmptyString(bet.answer))
                            {
                                if (bet.answer == userBet.value)
                                {
                                    u.dota2EpicCenter2019.coins += userBet.coins * 2;
                                    userBet.status = "win";
                                    //if win also add action:
                                    let hasAction = false;
                                    for (var i = 0; i < u.dota2EpicCenter2019.actions.length; i++)
                                    {
                                        if (u.dota2EpicCenter2019.actions[i].token == bet.token)
                                        {
                                            hasAction = true;
                                            break;
                                        }
                                    }
                                    if (!hasAction)
                                    {
                                        u.dota2EpicCenter2019.actions.push({
                                            token: bet.token,
                                            reward: userBet.coins * 2,
                                            createdAt: moment_now(),
                                        });
                                    }
                                }
                                else
                                {
                                    if (bet.reward != -1398)
                                        u.dota2EpicCenter2019.coins += userBet.coins;
                                    //otherwise u will loose coins if u were wrong
                                    userBet.status = "loose";
                                }
                            }
                        }
                    }
                    if (u.dota2EpicCenter2019.coins < minCoins)
                        u.dota2EpicCenter2019.coins = minCoins;
                    this.User.findByIdAndUpdate(u._id, { $set: { dota2EpicCenter2019: u.dota2EpicCenter2019 } }, { new: true }, (err, result) =>
                    {
                        if (err)
                        {
                            console.log('FATAL ERROR UPDATING USER dota2EpicCenter2019=>' + u._id);
                            editUser(index + 1, finish);
                            return;
                        }
                        usersAffected++;
                        editUser(index + 1, finish);
                    });
                };
                editUser(0, () =>
                {
                    resolve({ usersAffected: usersAffected });
                });
            });
        });
    }
    checkInstagram(_id)
    {
        return new Promise((resolve, reject) =>
        {
            this.User.findOne({ _id: _id }).exec((err, user) =>
            {
                if (err)
                {
                    reject(err.toString());
                    return;
                }
                //check if user already has this action:
                for (var i = 0; i < user.dota2EpicCenter2019.actions.length; i++)
                {
                    if (user.dota2EpicCenter2019.actions[i].token == FOLLOW_INSTAGRAM_WOG)
                    {
                        reject('action already done');
                        return;
                    }
                }
                console.log(user.instagramID);
                //check instagram api:
                ; (async (wogUser, resolve, reject) =>
                {
                    console.log('ok lets check instagram');
                    try
                    {
                        const client = new Instagram({ username: 'wogcompany', password: 'wog2019omid2019' });
                        console.log('client created')
                        const { authenticated, user } = await client.login({ username: 'wogcompany', password: 'wog2019omid2019' })
                        console.log('login success = ' + authenticated);
                        const profile = await client.getProfile()
                        console.log('check profile success');
                        console.log(profile);
                        let followers = await client.getFollowers({ userId: 11042593044, first: 5000 });
                        console.log(`we have ${followers.length} followers`);
                        console.log(wogUser.instagramID);
                        for (var i = 0; i < followers.length; i++)
                        {
                            console.log(followers[i].username);
                            if (followers[i].username == wogUser.instagramID)
                            {
                                console.log('found in followers!');
                                this.addAction({ _id: wogUser._id, userToken: wogUser.token, token: FOLLOW_INSTAGRAM_WOG })
                                    .then(resolve).catch(reject);
                                return;
                            }
                        }
                        console.log(`${wogUser.instagramID} not following instagram`);
                        reject('not following instagram');

                    }
                    catch (err)
                    {
                        reject(err.toString());
                    }
                })(user, resolve, reject);
                // const client = new Instagram({ username: 'wogcompany', password: 'omid2019wog2019' });
                // client.login({ username: 'wogcompany', password: 'omid2019wog2019' }).then((authenticated, instaUser) =>
                // {
                //     console.log('login success');
                //     client.getProfile().then((profile)=>{
                //         console.log(profile);
                //     });
                //     client.getFollowers({ userId: 11042593044, first: 5000 }).then((followers) =>
                //     {
                //         console.log('followers count = '+followers.length);
                //         for (var i = 0; i < followers.length; i++)
                //         {
                //             console.log(followers[i].username);
                //             if (followers[i].username == user.instagramID)
                //             {
                //                 this.addAction({ _id: user._id, userToken: user.token, token: FOLLOW_INSTAGRAM_WOG })
                //                     .then(resolve).catch(reject);
                //             }
                //         }
                //         reject('not following instagram');
                //     }).catch(reject);
                // }).catch(reject);
            });
        });
    }
    checkTwitch(params = { _id: '', userToken: '', channelName: '', twitchFollowerUsername: '' })
    {
        // console.log(params);
        return new Promise((resolve, reject) =>
        {
            if (isEmptyString(params._id))
            {
                reject('missing parameter _id');
                return;
            }
            if (isEmptyString(params.userToken))
            {
                reject('missing parameter userToken');
                return;
            }
            if (isEmptyString(params.channelName))
            {
                reject('missing parameter channelName');
                return;
            }
            if (isEmptyString(params.twitchFollowerUsername))
            {
                reject('missing parameter twitchFollowerUsername');
                return;
            }
            TWITCH_API.users.usersByName({ users: params.twitchFollowerUsername, limit: 100 }, (err, response) =>
            {
                if (err)
                {
                    reject(err.toString());
                    return;
                }
                if (response.users == undefined || response.users.length == 0)
                {
                    reject('twitch user not found');
                    return;
                }
                let user = response.users[0];
                // console.log(user);
                TWITCH_API.users.follows({ userID: user._id, limit: 100, offset: 0, direction: "desc", sortby: "created_at" }, (err, response) =>
                {
                    if (err)
                    {
                        reject(err.toString());
                        return;
                    }
                    for (var i = 0; i < response.follows.length; i++)
                    {
                        let channel = response.follows[i].channel;
                        // console.log(channel.display_name);
                        if (channel.display_name == params.channelName)
                        {
                            this.addAction({ _id: params._id, userToken: params.userToken, token: FOLLOW_TWITCH })
                                .then(resolve).catch(reject);
                            return;
                        }
                    }
                    reject('not following the required channel');
                });
            });
        });
    }
    getLeaderboard(userId = undefined)
    {
        return new Promise((resolve, reject) =>
        {
            this.User.find({ 'dota2EpicCenter2019.enterEvent': true }).limit(60000).exec((err, users) =>
            {
                if (err)
                {
                    reject(err.toString());
                    return;
                }
                for (var i = 0; i < users.length; i++)
                {
                    let u = users[i];
                    u.dota2EpicCenter2019.totalCoins = u.dota2EpicCenter2019.coins;
                    for (var j = 0; j < u.dota2EpicCenter2019.bets.length; j++)
                    {
                        let b = u.dota2EpicCenter2019.bets[j];
                        if (b.status == 'pending')
                            u.dota2EpicCenter2019.totalCoins += b.coins;
                    }
                }
                //bubble sort based on totalCoins:
                for (var i = 0; i < users.length; i++)
                {
                    for (var j = i; j < users.length; j++)
                    {
                        if (users[i].dota2EpicCenter2019.totalCoins < users[j].dota2EpicCenter2019.totalCoins)
                        {
                            let temp = users[i];
                            users[i] = users[j];
                            users[j] = temp;
                        }
                    }
                }
                let rank = undefined;
                if (userId != undefined)
                {
                    for (var i = 0; i < users.length; i++)
                    {
                        if (users[i]._id == userId)
                        {
                            rank = i;
                            break;
                        }
                    }
                }
                resolve({ users, rank });
            });
        });
    }
}