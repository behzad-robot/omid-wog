import { isEmptyString, moment_now } from "../utils/utils";
import { SocketRouter } from "./socket_router";
import APIRouter from "./api_router";
const fs = require('fs');
const path = require('path');
const VALID_ACTIONS_FILE_PATH = path.resolve('../storage/esl-one-birmingham-2019/valid-actions.json');

const Instagram = require('instagram-web-api');
const TWITCH_API = require('twitch-api-v5');
TWITCH_API.clientID = '3j5qf1r09286hluj7rv4abqkbqosk3';

const INIT_COINS = 40;
const FOLLOW_INSTAGRAM_WOG = 'follow_instagram';
const FOLLOW_TWITCH = 'follow_twitch';
const VALID_ACTIONS = [
    { active: true, token: 'matchup_vici_gaming', reward: -1, isBet: true, maxCoins: 100, answer: undefined, options: ['tashtak_sazan', 'monster_gaming'] },
    { active: true, token: 'matchup_vici_gaming_vs_fox_gaming', reward: -1, isBet: true, maxCoins: 300, answer: undefined, options: ['tashtak_sazan', 'monster_gaming'] },
    //group a:
    { "active": true, "token": "matchup_vici_gaming_vs_team_liquid", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["vici_gaming", "team_liquid"] , "answer" : "vici_gaming" },
    { "active": true, "token": "matchup_vici_gaming_vs_ninjas_in_pyjamas", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["vici_gaming", "ninjas_in_pyjamas"] },
    { "active": true, "token": "matchup_vici_gaming_vs_og", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["vici_gaming", "og"] },
    { "active": true, "token": "matchup_vici_gaming_vs_forward_gaming", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["vici_gaming", "forward_gaming"] },
    { "active": true, "token": "matchup_vici_gaming_vs_tnc_predator", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["vici_gaming", "tnc_predator"] },
    { "active": true, "token": "matchup_team_liquid_vs_ninjas_in_pyjamas", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["team_liquid", "ninjas_in_pyjamas"] },
    { "active": true, "token": "matchup_team_liquid_vs_og", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["team_liquid", "og"] }, { "active": true, "token": "matchup_team_liquid_vs_forward_gaming", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["team_liquid", "forward_gaming"] }, { "active": true, "token": "matchup_team_liquid_vs_tnc_predator", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["team_liquid", "tnc_predator"] }, { "active": true, "token": "matchup_ninjas_in_pyjamas_vs_og", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["ninjas_in_pyjamas", "og"] }, { "active": true, "token": "matchup_ninjas_in_pyjamas_vs_forward_gaming", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["ninjas_in_pyjamas", "forward_gaming"] }, { "active": true, "token": "matchup_ninjas_in_pyjamas_vs_tnc_predator", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["ninjas_in_pyjamas", "tnc_predator"] }, { "active": true, "token": "matchup_og_vs_forward_gaming", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["og", "forward_gaming"] }, { "active": true, "token": "matchup_og_vs_tnc_predator", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["og", "tnc_predator"] }, { "active": true, "token": "matchup_forward_gaming_vs_tnc_predator", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["forward_gaming", "tnc_predator"] },
    //group b:
    { "active": false, "token": "matchup_team_secret_vs_evil_geniuses", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["team_secret", "evil_geniuses"], answer: 'team_secret' },
    { "active": false, "token": "matchup_team_secret_vs_psg_lgd", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["team_secret", "psg_lgd"], answer: 'team_secret' },
    { "active": false, "token": "matchup_team_secret_vs_keen_gaming", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["team_secret", "keen_gaming"], answer: 'team_secret' },
    { "active": true, "token": "matchup_team_secret_vs_alliance", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["team_secret", "alliance"] }, { "active": true, "token": "matchup_team_secret_vs_gambit_esports", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["team_secret", "gambit_esports"] }, { "active": true, "token": "matchup_evil_geniuses_vs_psg_lgd", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["evil_geniuses", "psg_lgd"] }, { "active": true, "token": "matchup_evil_geniuses_vs_keen_gaming", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["evil_geniuses", "keen_gaming"] }, { "active": true, "token": "matchup_evil_geniuses_vs_alliance", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["evil_geniuses", "alliance"] }, { "active": true, "token": "matchup_evil_geniuses_vs_gambit_esports", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["evil_geniuses", "gambit_esports"] }, { "active": true, "token": "matchup_psg_lgd_vs_keen_gaming", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["psg_lgd", "keen_gaming"] }, { "active": true, "token": "matchup_psg_lgd_vs_alliance", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["psg_lgd", "alliance"] }, { "active": true, "token": "matchup_psg_lgd_vs_gambit_esports", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["psg_lgd", "gambit_esports"] }, { "active": true, "token": "matchup_keen_gaming_vs_alliance", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["keen_gaming", "alliance"] }, { "active": true, "token": "matchup_keen_gaming_vs_gambit_esports", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["keen_gaming", "gambit_esports"] }, { "active": true, "token": "matchup_alliance_vs_gambit_esports", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["alliance", "gambit_esports"] },
    { active: true, token: FOLLOW_INSTAGRAM_WOG, reward: 10 },
    { active: true, token: FOLLOW_TWITCH, reward: 100 },
];

function getAction(token)
{
    for (var i = 0; i < VALID_ACTIONS.length; i++)
    {
        if (VALID_ACTIONS[i].token == token)
            return VALID_ACTIONS[i];
    }

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
        this.router.post('/enter-event', (req, res) =>
        {
            this.handleError(req, res, 'HTTP not allowed');
        });
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
        this.router.post('/check-instgram-is-followed', (req, res) =>
        {
            this.handleError(req, res, 'HTTP not allowed');
        });
        this.router.post('/check-twitch-is-followed', (req, res) =>
        {
            this.handleError(req, res, 'HTTP not allowed');
        });
        this.router.get('/dota2-book-leaderboard', (req, res) =>
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
        if (request.method == 'dota2-book-enter-event')
        {
            this.handler.enterEvent(request.params).then((user) =>
            {
                this.sendResponse(socket, request, user);
            }).catch((err) =>
            {
                this.handleError(socket, request, err.toString());
            });
        }
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
        else if (request.method == 'dota2-book-update-all-bets')
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
        else if (request.method == 'dota2-book-check-instagram')
        {
            this.handler.checkInstagram(request.params._id).then((user) =>
            {
                this.sendResponse(socket, request, user);
            }).catch((err) =>
            {
                this.handleError(socket, request, err.toString());
            });
        }
        else if (request.method == 'dota2-book-check-twitch')
        {
            this.handler.checkTwitch(request.params).then((user) =>
            {
                this.sendResponse(socket, request, user);
            }).catch((err) =>
            {
                this.handleError(socket, request, err.toString());
            });
        }
        else if (request.method == 'dota2-book-leaderboard')
        {
            this.handler.getLeaderboard(request.params._id).then((result) =>
            {
                this.sendResponse(socket, request, result);
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
        this.enterEvent = this.enterEvent.bind(this);
        this.doPayment = this.doPayment.bind(this);
        this.addAction = this.addAction.bind(this);
        this.checkInstagram = this.checkInstagram.bind(this);
        this.checkTwitch = this.checkTwitch.bind(this);
        this.getLeaderboard = this.getLeaderboard.bind(this);
        this.updateAllBets = this.updateAllBets.bind(this);
    }
    checkAndFixUser(user)
    {
        if (user.dota2Book2019 == undefined)
        {
            user.dota2Book2019 = {
                initPayment: false,
                initPaymentToken: "",
                initPaymentDate: "",
                freeActions: 3,
                coins: 0,
                actions: [], // { token : string , reward : int , createdAt : string }
                bets: [], // { token : string , value : int , status : string , createdAt : string } // status : pending , win , loose
            };
        }
        return user;
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
                if (player.dota2Book2019.enterEvent)
                {
                    reject('already entered event.');
                    return;
                }
                player = this.checkAndFixUser(player);
                player.dota2Book2019.enterEvent = true;
                player.dota2Book2019.coins = INIT_COINS;
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
                if (player.dota2Book2019.initPayment)
                {
                    reject('already payed for event!');
                    return;
                }
                player = this.checkAndFixUser(player);
                player.dota2Book2019.enterEvent = true;
                player.dota2Book2019.initPayment = true;
                player.dota2Book2019.initPaymentToken = params.initPaymentToken;
                player.dota2Book2019.initPaymentDate = moment_now();
                player.dota2Book2019.coins = INIT_COINS;
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
            let action = getAction(params.token);
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
                // if (player.dota2Book2019 == undefined || !player.dota2Book2019.initPayment)
                // {
                //     reject('payment not done');
                //     return;
                // }
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
            this.User.find({ 'dota2Book2019.enterEvent': true}).limit(20000).exec((err, users) =>
            {
                console.log('Users of event=>'+users.length);
                if (err)
                {
                    reject(err.toString());
                    return;
                }
                let usersAffected = 0;
                const validActionsFromFile = JSON.parse(fs.readFileSync(VALID_ACTIONS_FILE_PATH).toString());
                console.log('actions from file='+validActionsFromFile.length);
                let getBetFromFile = (token)=>{
                    for(var i = 0 ; i < validActionsFromFile.length;i++){
                        if(validActionsFromFile[i].token == token)
                            return validActionsFromFile[i];
                    }
                    return undefined;
                };
                let editUser = (index, finish)=>
                {
                    if (index >= users.length)
                    {
                        finish();
                        return;
                    }
                    let u = users[index];
                    for (var i = 0; i < u.dota2Book2019.bets.length; i++)
                    {
                        let userBet = u.dota2Book2019.bets[i];
                        if (userBet.status == 'pending')
                        {
                            let bet = getBetFromFile(userBet.token);
                            if(bet == undefined)
                            {
                                console.log(userBet.token+' bet not found!');
                                continue;
                            }
                            if (!isEmptyString(bet.answer))
                            {
                                if (bet.answer == userBet.value)
                                {
                                    u.dota2Book2019.coins += userBet.coins * 2;
                                    userBet.status = "win";
                                    //if win also add action:
                                    let hasAction = false;
                                    for(var i = 0 ; i < u.dota2Book2019.actions.length;i++){
                                        if(u.dota2Book2019.actions[i].token == bet.token){
                                            hasAction = true;
                                            break;
                                        }
                                    }
                                    if(!hasAction)
                                    {
                                        u.dota2Book2019.actions.push({
                                            token : bet.token,
                                            reward : userBet.coins*2,
                                            createdAt : moment_now(),
                                        });
                                    }
                                }
                                else
                                {
                                    u.dota2Book2019.coins += userBet.coins;
                                    userBet.status = "loose";
                                }
                            }
                        }
                    }
                    this.User.findByIdAndUpdate(u._id, { $set: { dota2Book2019: u.dota2Book2019 } }, { new: true }, (err, result) =>
                    {
                        if (err)
                        {
                            console.log('FATAL ERROR UPDATING USER dota2Book2019=>' + u._id);
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
                for (var i = 0; i < user.dota2Book2019.actions.length; i++)
                {
                    if (user.dota2Book2019.actions[i].token == FOLLOW_INSTAGRAM_WOG)
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
                        if (channel.display_name == params.channelName)
                        {
                            this.addAction({ _id: params._id, userToken: params.userToken, token: FOLLOW_TWITCH })
                                .then(resolve).catch(reject);
                            return;
                        }
                    }
                });
            });
        });
    }
    getLeaderboard(userId = undefined)
    {
        return new Promise((resolve, reject) =>
        {
            this.User.find({ 'dota2Book2019.enterEvent': true }).limit(60000).exec((err, users) =>
            {
                if (err)
                {
                    reject(err.toString());
                    return;
                }
                for (var i = 0; i < users.length; i++)
                {
                    let u = users[i];
                    u.dota2Book2019.totalCoins = u.dota2Book2019.coins;
                    for (var j = 0; j < u.dota2Book2019.bets.length; j++)
                    {
                        let b = u.dota2Book2019.bets[j];
                        if (b.status == 'pending')
                            u.dota2Book2019.totalCoins += b.coins;
                    }
                }
                //bubble sort based on totalCoins:
                for (var i = 0; i < users.length; i++)
                {
                    for (var j = i; j < users.length; j++)
                    {
                        if (users[i].dota2Book2019.totalCoins < users[j].dota2Book2019.totalCoins)
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