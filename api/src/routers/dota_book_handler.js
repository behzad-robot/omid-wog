import { isEmptyString, moment_now } from "../utils/utils";
const INIT_COINS = 40;
const VALID_ACTIONS = [
    { token: 'matchup_tashtak_vs_fox', reward: -1, isBet: true, maxCoins: 100, answer: undefined },
    { token: 'follow_instagram', reward: 10 },
];
function isValidActionToken(token, onlyBet = false)
{
    for (var i = 0; i < VALID_ACTIONS.length; i++)
    {
        if (token == VALID_ACTIONS[i].token)
        {
            if (!onlyBet)
                return true;
            else
                return (VALID_ACTIONS[i].isBet != undefined && VALID_ACTIONS[i].isBet === true);
        }
    }
    return false;
}
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
export class DotaBookHandler 
{
    constructor(User)
    {
        this.User = User;
        //routers:
        this.httpRouter = new OTPHttpRouter(this);
        this.socketRouter = new OTPSocketRouter(this);
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
        if (!isValidActionToken(params.token))
        {
            reject('invalid action token');
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
    }
    addBet(params) // params is : { _id : string , token : string ,betCoins : int , userToken : string (user.token )}
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
        if (isEmptyString(params.betCoins))
        {
            reject('missing parameter betCoins');
            return;
        }
        if (isEmptyString(params.value))
        {
            reject('missing parameter value');
            return;
        }
        //check if token is valid
        if (!isValidActionToken(params.token, true))
        {
            reject('invalid bet token');
            return;
        }
        let bet = getAction(params.token);
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
            for (var i = 0; i < player.dota2Book2019.bets.length; i++)
            {
                if (player.dota2Book2019.bets[i].token == params.token)
                {
                    reject('bet already done');
                    return;
                }
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