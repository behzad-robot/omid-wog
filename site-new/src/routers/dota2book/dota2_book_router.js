import SiteRouter from "../site_router";
import { SITE_URL } from "../../constants"
import { isEmptyString } from "../../utils/utils";
import { ESL_TEAMS, GROUP_A, GROUP_B } from "./esl_teams";
const fs = require('fs');
const path = require('path');
const SLUG = '/dota2-book';
//actions :
const FOLLOW_INSTAGRAM_WOG = 'follow_instagram';
const FOLLOW_TWITCH = 'follow_twitch';
const VALID_ACTIONS_FILE_PATH = path.resolve('../storage/esl-one-birmingham-2019/valid-actions.json');
const TWITCH_CODE_FILE_PATH = path.resolve('../storage/esl-one-birmingham-2019/twitch-code.txt');
/*const VALID_ACTIONS = [
    { active: true, token: 'matchup_vici_gaming', reward: -1, isBet: true, maxCoins: 100, answer: undefined, options: ['tashtak_sazan', 'monster_gaming'] },
    { active: true, token: 'matchup_vici_gaming_vs_fox_gaming', reward: -1, isBet: true, maxCoins: 300, answer: undefined, options: ['tashtak_sazan', 'monster_gaming'] },
    //group a:
    { "active": true, "token": "matchup_vici_gaming_vs_team_liquid", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["vici_gaming", "team_liquid"] },
    { "active": true, "token": "matchup_vici_gaming_vs_ninjas_in_pyjamas", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["vici_gaming", "ninjas_in_pyjamas"] },
    { "active": true, "token": "matchup_vici_gaming_vs_og", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["vici_gaming", "og"] },
    // { "active": true, "token": "matchup_vici_gaming_vs_forward_gaming", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["vici_gaming", "forward_gaming"] },
    // { "active": true, "token": "matchup_vici_gaming_vs_tnc_predator", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["vici_gaming", "tnc_predator"] },
    // { "active": true, "token": "matchup_team_liquid_vs_ninjas_in_pyjamas", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["team_liquid", "ninjas_in_pyjamas"] },
    // { "active": true, "token": "matchup_team_liquid_vs_og", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["team_liquid", "og"] }, { "active": true, "token": "matchup_team_liquid_vs_forward_gaming", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["team_liquid", "forward_gaming"] }, { "active": true, "token": "matchup_team_liquid_vs_tnc_predator", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["team_liquid", "tnc_predator"] }, { "active": true, "token": "matchup_ninjas_in_pyjamas_vs_og", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["ninjas_in_pyjamas", "og"] }, { "active": true, "token": "matchup_ninjas_in_pyjamas_vs_forward_gaming", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["ninjas_in_pyjamas", "forward_gaming"] }, { "active": true, "token": "matchup_ninjas_in_pyjamas_vs_tnc_predator", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["ninjas_in_pyjamas", "tnc_predator"] }, { "active": true, "token": "matchup_og_vs_forward_gaming", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["og", "forward_gaming"] }, { "active": true, "token": "matchup_og_vs_tnc_predator", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["og", "tnc_predator"] }, { "active": true, "token": "matchup_forward_gaming_vs_tnc_predator", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["forward_gaming", "tnc_predator"] },
    //group b:
    { "active": false, "token": "matchup_team_secret_vs_evil_geniuses", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["team_secret", "evil_geniuses"], answer: 'team_secret' },
    { "active": false, "token": "matchup_team_secret_vs_psg_lgd", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["team_secret", "psg_lgd"], answer: 'team_secret' },
    { "active": false, "token": "matchup_team_secret_vs_keen_gaming", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["team_secret", "keen_gaming"], answer: 'team_secret' },
    { "active": true, "token": "matchup_team_secret_vs_alliance", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["team_secret", "alliance"] },
    //  { "active": true, "token": "matchup_team_secret_vs_gambit_esports", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["team_secret", "gambit_esports"] }, { "active": true, "token": "matchup_evil_geniuses_vs_psg_lgd", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["evil_geniuses", "psg_lgd"] }, { "active": true, "token": "matchup_evil_geniuses_vs_keen_gaming", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["evil_geniuses", "keen_gaming"] }, { "active": true, "token": "matchup_evil_geniuses_vs_alliance", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["evil_geniuses", "alliance"] }, { "active": true, "token": "matchup_evil_geniuses_vs_gambit_esports", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["evil_geniuses", "gambit_esports"] }, { "active": true, "token": "matchup_psg_lgd_vs_keen_gaming", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["psg_lgd", "keen_gaming"] }, { "active": true, "token": "matchup_psg_lgd_vs_alliance", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["psg_lgd", "alliance"] }, { "active": true, "token": "matchup_psg_lgd_vs_gambit_esports", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["psg_lgd", "gambit_esports"] }, { "active": true, "token": "matchup_keen_gaming_vs_alliance", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["keen_gaming", "alliance"] }, { "active": true, "token": "matchup_keen_gaming_vs_gambit_esports", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["keen_gaming", "gambit_esports"] }, { "active": true, "token": "matchup_alliance_vs_gambit_esports", "reward": -1, "isBet": true, "maxCoins": 100, "options": ["alliance", "gambit_esports"] },
    { active: true, token: FOLLOW_INSTAGRAM_WOG , reward: 10 },
    { active: true, token: FOLLOW_TWITCH, reward: 100 },
];*/
function getAction(VALID_ACTIONS, token)
{
    for (var i = 0; i < VALID_ACTIONS.length; i++)
        if (VALID_ACTIONS[i].token == token)
            return VALID_ACTIONS[i];
    return undefined;
}
function getAllBets(VALID_ACTIONS)
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
            if (!this.isLoggedIn(req) && req.url.indexOf('eua') == -1 && req.url.indexOf('leaderboard') == -1
            && req.url.indexOf('winners') == -1)
            {
                res.redirect('/login?redirect=/dota2-book');
                return;
            }
            next();
        });
        // this.router.get('/landing', (req, res) =>
        // {
        //     this.renderTemplate(req, res, 'dota2book/dota2-book-landing.html', {});
        // });
        this.router.get('/winners', (req, res) =>
        {
            this.renderTemplate(req, res, 'dota2book/dota2-book-winners.html', {
                
            });
        });

        // this.router.get('/eua', (req, res) =>
        // {
        //     if (req.query.msg == 'acceptFirst')
        //         req.query.msg = 'ابتدا شرایط و قوانین ایونت را بپذیرید';
        //     this.renderTemplate(req, res, 'dota2book/dota2-book-eua.html', {
        //         msg: req.query.msg,
        //     });
        // });
        // this.router.get('/enter-event', (req, res) =>
        // {
        //     let currentUser = req.session.currentUser;
        //     if (currentUser.dota2Book2019.enterEvent)
        //     {
        //         res.redirect(SLUG + '/?msg=alreadyEntered');
        //         return;
        //     }
        //     siteModules.User.apiCall('dota2-book-enter-event', { _id: currentUser._id, userToken: currentUser.token }).then((user) =>
        //     {
        //         console.log(user);
        //         req.session.currentUser = user;
        //         req.session.save(() =>
        //         {
        //             res.redirect(SLUG);
        //         });
        //     }).catch((err) =>
        //     {
        //         this.show500(req, res, err);
        //     });
        // });
        // this.router.get('/payment', (req, res) =>
        // {
        //     let currentUser = req.session.currentUser;
        //     siteModules.User.apiCall('dota2-book-do-payment', { _id: currentUser._id, initPaymentToken: 'random-token-doki-doki', userToken: currentUser.token }).then((user) =>
        //     {
        //         req.session.currentUser = user;
        //         req.session.save(() =>
        //         {
        //             this.renderTemplate(req, res, 'dota2book/dota2-book-payment-done.html', {
        //                 msg: req.query.msg,
        //             });
        //         });
        //     }).catch((err) =>
        //     {
        //         this.show500(req, res, err.toString());
        //     });

        // });
        // this.router.get('/', (req, res) =>
        // {
        //     siteModules.User.apiCall('login',{ username: req.session.currentUser.username, password: req.session.currentUser.password }).then((user) =>
        //     {
        //         req.session.currentUser = user;
        //         let currentUser = req.session.currentUser;
        //         if (currentUser.dota2Book2019 == undefined || !currentUser.dota2Book2019.enterEvent)
        //         {
        //             res.redirect(SLUG + '/eua/?msg=acceptFirst');
        //             return;
        //         }
        //         let VALID_ACTIONS = JSON.parse(fs.readFileSync(VALID_ACTIONS_FILE_PATH).toString());
        //         let TWITCH_CODE_STR = fs.readFileSync(TWITCH_CODE_FILE_PATH).toString();
        //         siteModules.User.apiCall('dota2-book-leaderboard', { _id: currentUser._id }).then((resp) =>
        //         {
        //             let rank = resp.rank;
        //             this.renderTemplate(req, res, 'dota2book/dota2-book-home.html', {
        //                 rank: rank + 1,
        //                 user: currentUser,
        //                 ESL_TEAMS: JSON.stringify(ESL_TEAMS),
        //                 GROUP_A: JSON.stringify(GROUP_A),
        //                 GROUP_B: JSON.stringify(GROUP_B),
        //                 ALL_BETS: JSON.stringify(getAllBets(VALID_ACTIONS)),
        //                 DOTA2_BOOK_2019: JSON.stringify(currentUser.dota2Book2019),
        //                 TWITCH_CODE_STR: TWITCH_CODE_STR,
        //             });
        //         }).catch((err) =>
        //         {
        //             this.show500(req, res, err);
        //         })
        //     });
        // });
        this.router.get('/leaderboard', (req, res) =>
        {
            //list of dota2book gamblers!
            siteModules.User.apiCall('dota2-book-leaderboard', { _id: req.session.currentUser ? req.session.currentUser._id : undefined }).then((result) =>
            {
                this.renderTemplate(req, res, 'dota2book/dota2-book-leaderboard.html', {
                    players: result.users,
                });
            }).catch((err) =>
            {
                this.show500(req, res, err);
            });

        });
        this.router.post('/submit-bets', (req, res) =>
        {
            let currentUser = req.session.currentUser;
            if (currentUser.dota2Book2019 == undefined)
            {
                res.redirect(SLUG + '/eua/?msg=payFirst');
                return;
            }
            const VALID_ACTIONS = JSON.parse(fs.readFileSync(VALID_ACTIONS_FILE_PATH).toString());
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
                let bet = getAction(VALID_ACTIONS, betToken);
                if (isEmptyString(betValue) || isNaN(betCoins) || !bet.active)
                {
                    handleBet(tokens, index + 1, finish);
                    return;
                }
                console.log(`${betToken} is being passed to webservice value ${betValue}`);
                siteModules.User.apiCall('dota2-book-add-bet', {
                    _id: currentUser._id,
                    userToken: currentUser.token,
                    token: betToken,
                    userToken: currentUser.token,
                    value: betValue,
                    betCoins: betCoins,
                }).then((user) =>
                {
                    console.log(betToken + ' was submitted successfully!');
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
                        res.redirect('/dota2-book/?msg=bet-already-done');
                        return;
                    }
                    res.status(500).send(err);
                });
            };
            let bets = getAllBets(VALID_ACTIONS);
            let betTokens = [];
            for (var i = 0; i < bets.length; i++)
                betTokens.push(bets[i].token)
            handleBet(betTokens, 0, () =>
            {
                res.redirect('/dota2-book/');
            });
        });
        this.router.get('/check-instagram', (req, res) =>
        {
            let currentUser = req.session.currentUser;
            if (isEmptyString(currentUser.instagramID))
            {
                res.send({ code: 500, error: 'instagramID is empty' });
                return;
            }
            siteModules.User.apiCall('dota2-book-check-instagram', { _id: currentUser._id }).then((user) =>
            {
                req.session.currentUser = user;
                req.session.save(() =>
                {
                    res.send(':) ok u can get ur coins now!');
                });
            }).catch((err) =>
            {
                res.send({ code: 500, error: err });
            });
        });
        this.router.get('/check-twitch', (req, res) =>
        {
            let currentUser = req.session.currentUser;
            if (isEmptyString(currentUser.twitchID))
            {
                res.send({ code: 400, error: 'twitchID is empty' });
                return;
            }
            siteModules.User.apiCall('dota2-book-check-twitch', { _id: currentUser._id, userToken: currentUser.token, channelName: req.query.channelName ? req.query.channelName : 'Amirphanthom', twitchFollowerUsername: currentUser.twitchID })
                .then((user) =>
                {
                    req.session.currentUser = user;
                    req.session.save(() =>
                    {
                        res.send({ code: 200, error: undefined });
                    });
                })
                .catch((err) =>
                {
                    res.send({ code: 500, error: err.toString() });
                });
        });
        this.router.get('/admin', (req, res) =>
        {
            let currentUser = req.session.currentUser;
            if (!currentUser.accessLevel.isAdmin)
            {
                res.status(400).send('access denied');
                return;
            }
            //check is has super access:
            let ok = false;
            for (var i = 0; i < currentUser.accessLevel.permissions.length; i++)
            {
                if (currentUser.accessLevel.permissions == 'super')
                {
                    ok = true;
                    break;
                }
            }
            if (!ok)
            {
                res.status(400).send('access denied');
                return;
            }
            const VALID_ACTIONS_STR = (fs.readFileSync(VALID_ACTIONS_FILE_PATH).toString());
            const TWITCH_CODE_STR = (fs.readFileSync(TWITCH_CODE_FILE_PATH).toString());;
            this.renderTemplate(req, res, 'dota2book/dota2-book-admin.html', {
                VALID_ACTIONS_STR: VALID_ACTIONS_STR,
                TWITCH_CODE_STR: TWITCH_CODE_STR,
            });
        });
        this.router.post('/admin/save-file', (req, res) =>
        {
            let currentUser = req.session.currentUser;
            if (!currentUser.accessLevel.isAdmin)
            {
                res.status(400).send('access denied');
                return;
            }
            //check is has super access:
            let ok = false;
            for (var i = 0; i < currentUser.accessLevel.permissions.length; i++)
            {
                if (currentUser.accessLevel.permissions == 'super')
                {
                    ok = true;
                    break;
                }
            }
            if (!ok)
            {
                res.status(400).send('access denied');
                return;
            }
            fs.writeFileSync(VALID_ACTIONS_FILE_PATH, req.body.valid_actions);
            fs.writeFileSync(TWITCH_CODE_FILE_PATH, req.body.twitch_code);
            res.redirect('/dota2-book/admin/?save=success');
        });
        this.router.get('/admin/update-all-bets', (req, res) =>
        {
            let currentUser = req.session.currentUser;
            if (!currentUser.accessLevel.isAdmin)
            {
                res.status(400).send('access denied');
                return;
            }
            //check is has super access:
            let ok = false;
            for (var i = 0; i < currentUser.accessLevel.permissions.length; i++)
            {
                if (currentUser.accessLevel.permissions == 'super')
                {
                    ok = true;
                    break;
                }
            }
            if (!ok)
            {
                res.status(400).send('access denied');
                return;
            }
            siteModules.User.apiCall('dota2-book-update-all-bets', { 'pass-token': 'dota2-ride' }).then((result) =>
            {
                res.send(result);
            }).catch((err) =>
            {
                res.status(500).send("ERROR:" + err.toString());
            });
        });
    }
}