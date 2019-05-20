import SiteRouter from "../site_router";
import { SITE_URL } from "../../constants"
import { isEmptyString } from "../../utils/utils";
import { ESL_TEAMS, GROUP_A, GROUP_B } from "./esl_teams";
const SLUG = '/dota2-book';
//actions :
const VALID_ACTIONS = [
    { active: true, token: 'matchup_vici_gaming', reward: -1, isBet: true, maxCoins: 100, answer: undefined, options: ['tashtak_sazan', 'monster_gaming'] },
    { active: true, token: 'matchup_vici_gaming_vs_fox_gaming', reward: -1, isBet: true, maxCoins: 300, answer: undefined, options: ['tashtak_sazan', 'monster_gaming'] },
    //group a:
    { "active": true, "token": "matchup_vici_gaming_vs_team_liquid", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["vici_gaming", "team_liquid"] },
    { "active": true, "token": "matchup_vici_gaming_vs_ninjas_in_pyjamas", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["vici_gaming", "ninjas_in_pyjamas"] },
    { "active": true, "token": "matchup_vici_gaming_vs_og", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["vici_gaming", "og"] },
    { "active": true, "token": "matchup_vici_gaming_vs_forward_gaming", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["vici_gaming", "forward_gaming"] },
    { "active": true, "token": "matchup_vici_gaming_vs_tnc_predator", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["vici_gaming", "tnc_predator"] },
    { "active": true, "token": "matchup_team_liquid_vs_ninjas_in_pyjamas", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["team_liquid", "ninjas_in_pyjamas"] },
    { "active": true, "token": "matchup_team_liquid_vs_og", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["team_liquid", "og"] }, { "active": true, "token": "matchup_team_liquid_vs_forward_gaming", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["team_liquid", "forward_gaming"] }, { "active": true, "token": "matchup_team_liquid_vs_tnc_predator", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["team_liquid", "tnc_predator"] }, { "active": true, "token": "matchup_ninjas_in_pyjamas_vs_og", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["ninjas_in_pyjamas", "og"] }, { "active": true, "token": "matchup_ninjas_in_pyjamas_vs_forward_gaming", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["ninjas_in_pyjamas", "forward_gaming"] }, { "active": true, "token": "matchup_ninjas_in_pyjamas_vs_tnc_predator", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["ninjas_in_pyjamas", "tnc_predator"] }, { "active": true, "token": "matchup_og_vs_forward_gaming", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["og", "forward_gaming"] }, { "active": true, "token": "matchup_og_vs_tnc_predator", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["og", "tnc_predator"] }, { "active": true, "token": "matchup_forward_gaming_vs_tnc_predator", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["forward_gaming", "tnc_predator"] },
    //group b:
    {"active":false,"token":"matchup_team_secret_vs_evil_geniuses","reward":-1,"isBet":true,"maxCoins":100,"options":["team_secret","evil_geniuses"]},
    {"active":true,"token":"matchup_team_secret_vs_psg_lgd","reward":-1,"isBet":true,"maxCoins":100,"options":["team_secret","psg_lgd"]},{"active":true,"token":"matchup_team_secret_vs_keen_gaming","reward":-1,"isBet":true,"maxCoins":100,"options":["team_secret","keen_gaming"]},{"active":true,"token":"matchup_team_secret_vs_alliance","reward":-1,"isBet":true,"maxCoins":100,"options":["team_secret","alliance"]},{"active":true,"token":"matchup_team_secret_vs_gambit_esports","reward":-1,"isBet":true,"maxCoins":100,"options":["team_secret","gambit_esports"]},{"active":true,"token":"matchup_evil_geniuses_vs_psg_lgd","reward":-1,"isBet":true,"maxCoins":100,"options":["evil_geniuses","psg_lgd"]},{"active":true,"token":"matchup_evil_geniuses_vs_keen_gaming","reward":-1,"isBet":true,"maxCoins":100,"options":["evil_geniuses","keen_gaming"]},{"active":true,"token":"matchup_evil_geniuses_vs_alliance","reward":-1,"isBet":true,"maxCoins":100,"options":["evil_geniuses","alliance"]},{"active":true,"token":"matchup_evil_geniuses_vs_gambit_esports","reward":-1,"isBet":true,"maxCoins":100,"options":["evil_geniuses","gambit_esports"]},{"active":true,"token":"matchup_psg_lgd_vs_keen_gaming","reward":-1,"isBet":true,"maxCoins":100,"options":["psg_lgd","keen_gaming"]},{"active":true,"token":"matchup_psg_lgd_vs_alliance","reward":-1,"isBet":true,"maxCoins":100,"options":["psg_lgd","alliance"]},{"active":true,"token":"matchup_psg_lgd_vs_gambit_esports","reward":-1,"isBet":true,"maxCoins":100,"options":["psg_lgd","gambit_esports"]},{"active":true,"token":"matchup_keen_gaming_vs_alliance","reward":-1,"isBet":true,"maxCoins":100,"options":["keen_gaming","alliance"]},{"active":true,"token":"matchup_keen_gaming_vs_gambit_esports","reward":-1,"isBet":true,"maxCoins":100,"options":["keen_gaming","gambit_esports"]},{"active":true,"token":"matchup_alliance_vs_gambit_esports","reward":-1,"isBet":true,"maxCoins":100,"options":["alliance","gambit_esports"]},
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
function getAllBets()
{
    let results = [];
    for (var i = 0; i < VALID_ACTIONS.length; i++)
    {
        if (VALID_ACTIONS[i].isBet)
            results.push(VALID_ACTIONS[i]);
    }
    return results;
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
            if (req.query.msg == 'acceptFirst')
                req.query.msg = 'ابتدا شرایط و قوانین ایونت را بپذیرید';
            this.renderTemplate(req, res, 'dota2book/dota2-book-eua.html', {
                msg: req.query.msg,
            });
        });
        this.router.get('/enter-event', (req, res) =>
        {
            let currentUser = req.session.currentUser;
            if (currentUser.dota2Book2019.enterEvent)
            {
                res.redirect(SLUG + '/?msg=alreadyEntered');
                return;
            }
            siteModules.User.apiCall('dota2-book-enter-event', { _id: currentUser._id, userToken: currentUser.token }).then((user) =>
            {
                console.log(user);
                req.session.currentUser = user;
                req.session.save(() =>
                {
                    res.redirect(SLUG);
                });
            }).catch((err) =>
            {
                this.show500(req, res, err);
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
            if (currentUser.dota2Book2019 == undefined || !currentUser.dota2Book2019.enterEvent)
            {
                res.redirect(SLUG + '/eua/?msg=acceptFirst');
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
            console.log(ESL_TEAMS);
            //the event page contains current bets,actions +link to other pages + ways to earn more shit this page is quite a lot!
            this.renderTemplate(req, res, 'dota2book/dota2-book-home.html', {
                user: currentUser,
                ESL_TEAMS: JSON.stringify(ESL_TEAMS),
                GROUP_A: JSON.stringify(GROUP_A),
                GROUP_B: JSON.stringify(GROUP_B),
                ALL_BETS: JSON.stringify(getAllBets()),
                DOTA2_BOOK_2019: JSON.stringify(currentUser.dota2Book2019),
            });
        });
        this.router.get('/leaderboard', (req, res) =>
        {
            //list of dota2book gamblers!
            siteModules.User.find({ 'dota2Book2019.initPayment': true, sort: '-dota2Book2019.coins' }).then((players) =>
            {
                this.renderTemplate(req, res, 'dota2book/dota2-book-leaderboard.html', {
                    players: players,
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