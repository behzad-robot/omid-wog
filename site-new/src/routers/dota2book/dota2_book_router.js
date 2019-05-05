import SiteRouter from "../site_router";
import { SITE_URL } from "../../constants"
import { isEmptyString } from "../../utils/utils";
const SLUG = '/dota2-book';
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
export class Dota2BookRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.use((req, res, next) =>
        {
            //check if user can visit this page:
            if (!this.isLoggedIn(req))
            {
                res.redirect('/login');
                return;
            }
            next();
        });
        this.router.get('/landing', (req, res) =>
        {
            this.renderTemplate(req, res, 'dota2book/dota2-book-landing.html', {});
        });
        this.router.get('/eua', (req, res) =>
        {
            if (req.query.msg == 'payFirst')
                req.query.msg = 'برای ورود به ایونت ابتدا پرداخت کنید!';
            this.renderTemplate(req, res, 'dota2book/dota2-book-eua.html', {
                msg: req.query.msg,
            });
        });
        this.router.get('/payment', (req, res) =>
        {
            let currentUser = req.session.currentUser;
            siteModules.User.apiCall('dota2-book-do-payment', { _id: currentUser._id, initPaymentToken: 'random-token-doki-doki', userToken: currentUser.token }).then((user) =>
            {
                req.session.currentUser = user;
                req.session.save(() =>
                {
                    this.renderTemplate(req, res, 'dota2book/dota2-book-payment-done.html', {
                        msg: req.query.msg,
                    });
                });
            }).catch((err) =>
            {
                this.show500(req, res, err.toString());
            });

        });
        this.router.get('/', (req, res) =>
        {
            let currentUser = req.session.currentUser;
            if (currentUser.dota2Book2019 == undefined || !currentUser.dota2Book2019.initPayment)
            {
                res.redirect(SLUG + '/eua/?msg=payFirst');
                return;
            }
            currentUser.dota2Book2019._bets = {};
            for (var i = 0; i < currentUser.dota2Book2019.bets.length; i++)
            {
                let t = currentUser.dota2Book2019.bets[i].token;
                currentUser.dota2Book2019._bets[t] = currentUser.dota2Book2019.bets[i];
                let b = currentUser.dota2Book2019._bets[t];
                let bet = getAction(t);
                for (var j = 0; j < bet.options.length; j++)
                {
                    let o = bet.options[j];
                    // console.log('bet value is =>'+b.value);
                    // console.log('options is =>'+o);
                    if (b.value == o)
                    {
                        b[o] = true;
                        break;
                    }

                }
            }
            //the event page contains current bets,actions +link to other pages + ways to earn more shit this page is quite a lot!
            this.renderTemplate(req, res, 'dota2book/dota2-book-home.html', {
                user: currentUser,
            });
        });
        this.router.get('/leaderboard', (req, res) =>
        {
            //list of dota2book gamblers!
            siteModules.User.find({ 'dota2Book2019.initPayment': true, sort: '-dota2Book2019.coins' }).then((players) =>
            {
                this.renderTemplate(req, res, 'dota2book/dota2-book-leaderboard.html', {
                    players : players,
                });
            });
        });
        this.router.post('/submit-bets', (req, res) =>
        {
            let currentUser = req.session.currentUser;
            if (currentUser.dota2Book2019 == undefined || !currentUser.dota2Book2019.initPayment)
            {
                res.redirect(SLUG + '/eua/?msg=payFirst');
                return;
            }
            let handleBet = (tokens, index, finish) =>
            {
                if (index >= tokens.length)
                {
                    finish();
                    return;
                }
                let betToken = tokens[index];
                let betCoins = parseInt(req.body[betToken + '-betCoins']);
                let betValue = req.body[betToken];
                console.log(betValue + 'is bet value!');
                console.log(betToken + 'is being passed to webservice');
                if (isEmptyString(betValue))
                {
                    handleBet(tokens, index + 1, finish);
                    return;
                }
                siteModules.User.apiCall('dota2-book-add-bet', {
                    _id: currentUser._id,
                    userToken: currentUser.token,
                    token: betToken,
                    userToken: currentUser.token,
                    value: betValue,
                    betCoins: betCoins,
                }).then((user) =>
                {
                    req.session.currentUser = user;
                    req.session.save(() =>
                    {
                        handleBet(tokens, index + 1, finish);
                    });
                }).catch((err) =>
                {
                    err = err.toString();
                    if (err == 'bet already done')
                    {
                        res.redirect('/dota2-book/');
                        return;
                    }
                    res.status(500).send(err);
                });
            };
            let bets = ['matchup_tashtak_vs_monster'];
            handleBet(bets, 0, () =>
            {
                res.redirect('/dota2-book/');
            });
        });
    }
}