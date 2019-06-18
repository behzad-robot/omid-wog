import SiteRouter from "../site_router";
import { SITE_URL } from "../../constants"
import { isEmptyString, moment_now } from "../../utils/utils";
// import { ESL_TEAMS, GROUP_A, GROUP_B } from "./esl_teams";
const fs = require('fs');
const path = require('path');
const SLUG = '/dota2-epic-center';
//actions :
const FOLLOW_INSTAGRAM_WOG = 'follow_instagram';
const FOLLOW_TWITCH = 'follow_twitch';
const TEAMS_FILE_PATH = path.resolve('../storage/epic-center-2019/teams.json');
const VALID_ACTIONS_FILE_PATH = path.resolve('../storage/epic-center-2019/valid-actions.json');
const ACTION_CATEGORIES_FILE_PATH = path.resolve('../storage/epic-center-2019/action-categories.json');
const TWITCH_CODE_FILE_PATH = path.resolve('../storage/epic-center-2019/twitch-code.txt');
const PAGE_CONFIG_FILE_PATH = path.resolve('../storage/epic-center-2019/page-config.json');
const QUIZ_SESSION_GOAL = 'dota2-epic-center-2019';
const QUIZ_REWARD = 10;
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
export class Dota2EpicCenterRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.use((req, res, next) =>
        {
            //check if user can visit this page:
            if (!this.isLoggedIn(req))
            {
                console.log('WE ARE NOT FUCKING LOGGED IN!');
                res.redirect('/login/?redirect=/dota2-epic-center');
                return;
            }
            // if (!this.isLoggedIn(req) && req.url.indexOf('eua') == -1 && req.url.indexOf('leaderboard') == -1)
            // {
            //     res.redirect('/login?redirect=/dota2-epic-center');
            //     return;
            // }
            next();
        });
        this.router.get('/landing', (req, res) =>
        {
            this.renderTemplate(req, res, 'epicenter-landing/landing.html', {});
        });
        this.router.get('/eua', (req, res) =>
        {
            if (req.query.msg == 'acceptFirst')
                req.query.msg = 'ابتدا شرایط و قوانین ایونت را بپذیرید';
            this.renderTemplate(req, res, 'dota2-epic-center/dota2-epic-center-eua.html', {
                msg: req.query.msg,
            });
        });
        this.router.get('/enter-event', (req, res) =>
        {
            let currentUser = req.session.currentUser;
            if (currentUser.dota2EpicCenter2019 != undefined && currentUser.dota2EpicCenter2019.enterEvent)
            {
                res.redirect(SLUG + '/?msg=alreadyEntered');
                return;
            }
            siteModules.User.apiCall('dota2-epic-center-enter-event', { _id: currentUser._id, userToken: currentUser.token }).then((user) =>
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
        // this.router.get('/payment', (req, res) =>
        // {
        //     let currentUser = req.session.currentUser;
        //     siteModules.User.apiCall('dota2-epic-center-do-payment', { _id: currentUser._id, initPaymentToken: 'random-token-doki-doki', userToken: currentUser.token }).then((user) =>
        //     {
        //         req.session.currentUser = user;
        //         req.session.save(() =>
        //         {
        //             this.renderTemplate(req, res, 'dota2-epic-center/dota2-epic-center-payment-done.html', {
        //                 msg: req.query.msg,
        //             });
        //         });
        //     }).catch((err) =>
        //     {
        //         this.show500(req, res, err.toString());
        //     });

        // });
        this.router.get('/', (req, res) =>
        {
            let fail = (err) =>
            {
                this.show500(req, res, err);
            }
            let currentUser = req.session.currentUser;
            if (currentUser.dota2EpicCenter2019 == undefined || !currentUser.dota2EpicCenter2019.enterEvent)
            {
                res.redirect(SLUG + '/eua/?msg=acceptFirst');
                return;
            }

            fs.readFile(VALID_ACTIONS_FILE_PATH, (err, data) =>
            {
                if (err)
                {
                    fail(err);
                    return;
                }
                let ACTIONS = JSON.parse(data.toString());
                fs.readFile(TEAMS_FILE_PATH, (err, data) =>
                {
                    if (err)
                    {
                        fail(err);
                        return;
                    }
                    let TEAMS = JSON.parse(data.toString());
                    fs.readFile(TWITCH_CODE_FILE_PATH, (err, data) =>
                    {
                        if (err)
                        {
                            fail(err);
                            return;
                        }
                        let TWITCH_CODE_STR = data.toString();
                        fs.readFile(ACTION_CATEGORIES_FILE_PATH, (err, data) =>
                        {
                            if (err)
                            {
                                fail(err);
                                return;
                            }
                            let ACTIONS_CATS = JSON.parse(data.toString());
                            fs.readFile(PAGE_CONFIG_FILE_PATH, (err, data) =>
                            {
                                if (err)
                                {
                                    fail(err);
                                    return;
                                }
                                const PAGE_CONFIG = JSON.parse(data.toString());
                                let invites = [];
                                for (var k = 0; k < currentUser.dota2EpicCenter2019.invites.length; k++)
                                    invites.push(currentUser.dota2EpicCenter2019.invites[k].userId);
                                siteModules.User.find({ _ids: invites }).then((invitedUsers) =>
                                {
                                    currentUser.dota2EpicCenter2019._invites = invitedUsers;
                                    siteModules.User.apiCall('dota2-epic-center-leaderboard', { _id: currentUser._id }).then((resp) =>
                                    {
                                        let rank = resp.rank;
                                        this.renderTemplate(req, res, 'dota2-epic-center/dota2-epic-center-home.html', {
                                            rank: rank + 1,
                                            user: currentUser,
                                            PAGE_CONFIG: PAGE_CONFIG,
                                            TWITCH_CODE_STR: TWITCH_CODE_STR,
                                            TEAMS: JSON.stringify(TEAMS),
                                            ACTIONS: JSON.stringify(ACTIONS),
                                            ACTIONS_CATS: JSON.stringify(ACTIONS_CATS),
                                            DOTA2_EPIC_CENTER_2019: JSON.stringify(currentUser.dota2EpicCenter2019),
                                        });
                                    }).catch(fail);
                                }).catch(fail);

                            });
                        });
                    });
                });
            });
        });
        this.router.get('/leaderboard', (req, res) =>
        {
            //list of dota2book gamblers!
            siteModules.User.apiCall('dota2-epic-center-leaderboard', { _id: req.session.currentUser ? req.session.currentUser._id : undefined }).then((result) =>
            {
                this.renderTemplate(req, res, 'dota2-epic-center/dota2-epic-center-leaderboard.html', {
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
            if (currentUser.dota2EpicCenter2019 == undefined)
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
                console.log(betToken+'=>'+betValue+'=>'+betCoins);
                if (isEmptyString(betValue) || isNaN(betCoins) || !bet.active)
                {
                    handleBet(tokens, index + 1, finish);
                    return;
                }
                console.log(`${betToken} is being passed to webservice value ${betValue}`);
                siteModules.User.apiCall('dota2-epic-center-add-bet', {
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
                        res.redirect('/dota2-epic-center/?msg=bet-already-done');
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
                res.redirect('/dota2-epic-center/');
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
            siteModules.User.apiCall('dota2-epic-center-check-instagram', { _id: currentUser._id }).then((user) =>
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
            siteModules.User.apiCall('dota2-epic-center-check-twitch', { _id: currentUser._id, userToken: currentUser.token, channelName: req.query.channelName ? req.query.channelName : 'Amirphanthom', twitchFollowerUsername: currentUser.twitchID })
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
        this.router.get('/enter-quiz', (req, res) =>
        {
            let currentUser = req.session.currentUser;
            let nowDate = moment_now();
            let date = nowDate.split(' ')[0];
            let nowParts = date.split('-');
            let nowMonth = nowParts[1], nowDay = nowParts[2];
            //check if session for today exists:
            for (var i = 0; i < currentUser.dota2Quiz.sessions.length; i++)
            {
                let session = currentUser.dota2Quiz.sessions[i];
                if (session.goal != QUIZ_SESSION_GOAL)
                    continue;
                let sessionDate = session.createdAt.split(' ')[0];
                let sessionParts = sessionDate.split('-');
                let sessionMonth = sessionParts[1], sessionDay = sessionParts[2];
                // if (sessionMonth == nowMonth && sessionDay == nowDay)
                // {
                //     console.log(session);
                //     if (session.status == 'loose')
                //     {
                //         session.reward = (session.questions.length - 1) * QUIZ_REWARD;
                //         this.renderTemplate(req, res, 'dota2-epic-center/dota2-epic-center-quiz-error.html', {
                //             session
                //         });
                //     }
                //     else
                //     {
                //         res.redirect('/dota2-epic-center/quiz/' + session._id);
                //     }
                //     return;
                // }
            }
            siteModules.User.apiCall('dota2-quiz-new-session', {
                userId: req.session.currentUser._id,
                userToken: req.session.currentUser.token,
                goal: QUIZ_SESSION_GOAL,
            }).then((response) =>
            {
                req.session.currentUser = response.user;
                req.session.save(() =>
                {
                    res.redirect('/dota2-epic-center/quiz/' + response.session._id);
                });
            }).catch((err) =>
            {
                this.show500(req, res, err);
            });
        });
        this.router.get('/quiz/:_id', (req, res) =>
        {
            siteModules.User.find({ _id: req.session.currentUser._id }).then((users) =>
            {
                let user = users[0];
                req.session.currentUser = user;
                let session = undefined;
                for (var i = 0; i < req.session.currentUser.dota2Quiz.sessions.length; i++)
                {
                    if (req.session.currentUser.dota2Quiz.sessions[i]._id == req.params._id)
                    {
                        session = req.session.currentUser.dota2Quiz.sessions[i];
                        break;
                    }
                }
                if (session == undefined)
                {
                    res.status(404).send('Session not found!');
                    return;
                }
                this.renderTemplate(req, res, '/dota2-epic-center/dota2-epic-center-quiz-page.html', {
                    session: session,
                    session_str: JSON.stringify(session),
                });
            }).catch((err) =>
            {
                this.show500(req, res, err);
            });
        });
        this.router.post('/finish-quiz', (req, res) =>
        {
            if (isEmptyString(req.body.userToken))
            {
                res.send({ code: 500, error: 'userToken is missing' });
                return;
            }
            if (isEmptyString(req.body.userId))
            {
                res.send({ code: 500, error: 'userId is missing' });
                return;
            }
            if (isEmptyString(req.body.sessionId))
            {
                res.send({ code: 500, error: 'sessionId is missing' });
                return;
            }
            siteModules.User.find({ _id: req.body._id  }).then((users) =>
            {
                let user = users[0];
                console.log(user);
                console.log(req.body.userToken);
                // if (user.token != req.body.userToken)
                // {
                //     res.send({ code: 500, error: 'invalid token' });
                //     return;
                // }
                let session = undefined;
                console.log('target sessionId='+req.body.sessionId);
                for (var i = 0; i < user.dota2Quiz.sessions.length; i++)
                {
                    console.log(user.dota2Quiz.sessions[i]._id);
                    if (user.dota2Quiz.sessions[i]._id == req.body.sessionId)
                    {
                        session = user.dota2Quiz.sessions[i];
                        break;
                    }
                }
                if(session == undefined)
                {
                    res.send({code : 500 , error :'session not found'});
                    return;
                }
                user.dota2EpicCenter2019.coins += (session.questions.length-1)*QUIZ_REWARD;
                siteModules.User.apiCall('edit-profile',{
                    _id : req.body.userId,
                    token : req.body.token,
                    dota2EpicCenter2019 : user.dota2EpicCenter2019,
                }).then((user)=>{
                    res.send({code : 200 , _data : {dota2EpicCenter2019 : user.dota2EpicCenter2019}});
                }).catch((err)=>{
                    res.send({code :500 , error : err.toString()});
                });
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
            const TWITCH_CODE_STR = (fs.readFileSync(TWITCH_CODE_FILE_PATH).toString());
            const TEAMS_STR = (fs.readFileSync(TEAMS_FILE_PATH).toString());
            const ACTION_CATEGORIES_STR = (fs.readFileSync(ACTION_CATEGORIES_FILE_PATH).toString());
            const PAGE_CONFIG = JSON.parse(fs.readFileSync(PAGE_CONFIG_FILE_PATH).toString())
            this.renderTemplate(req, res, 'dota2-epic-center/dota2-epic-center-admin.html', {
                VALID_ACTIONS_STR: VALID_ACTIONS_STR,
                TWITCH_CODE_STR: TWITCH_CODE_STR,
                TEAMS_STR: TEAMS_STR,
                ACTION_CATEGORIES_STR: ACTION_CATEGORIES_STR,
                PAGE_CONFIG: PAGE_CONFIG,
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
            fs.writeFileSync(TEAMS_FILE_PATH, req.body.teams);
            fs.writeFileSync(ACTION_CATEGORIES_FILE_PATH, req.body.action_cats);
            fs.writeFileSync(TWITCH_CODE_FILE_PATH, req.body.twitch_code);
            fs.writeFileSync(PAGE_CONFIG_FILE_PATH, JSON.stringify({ title: req.body.page_config_title, description: req.body.page_config_description }));
            res.redirect('/dota2-epic-center/admin/?save=success');
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
            siteModules.User.apiCall('dota2-epic-center-update-all-bets', { 'pass-token': 'dota2-ride' }).then((result) =>
            {
                res.send(result);
            }).catch((err) =>
            {
                res.status(500).send("ERROR:" + err.toString());
            });
        });
    }
}