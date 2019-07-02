import SiteRouter from "../site_router";
import { SITE_URL } from "../../constants";
import { isEmptyString, replaceAll } from "../../utils/utils";

export class SocialChallengesRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.use((req, res, next) =>
        {
            if (!this.isLoggedIn(req))
            {
                res.redirect('/login/?redirect=/social');
                return;
            }
            next();
        });
        this.router.get('/', (req, res) =>
        {
            siteModules.SocialChallenge.find({}).then((challenges) =>
            {
                console.log(challenges);
                this.renderTemplate(req, res, 'social/social-challenges-archive.html', {
                    challenges: challenges,
                });
            }).catch((err) =>
            {
                this.show500(req, res, err);
            });
        });
        this.router.get('/:slug', (req, res) =>
        {
            let fail = (err) =>
            {
                this.show500(req, res, err);
            }
            req.params.slug = req.params.slug.toLowerCase();
            siteModules.SocialChallenge.find({ slug: req.params.slug }).then((cs) =>
            {
                let challenge = cs[0];
                if (challenge == undefined)
                {
                    this.show404(req, res);
                    return;
                }
                siteModules.User.find({ _ids: challenge.users }).then((users) =>
                {
                    challenge._users = users;
                    challenge._lastUsers = [];
                    for (var i = 0; i < users.length && i < 6; i++)
                        challenge._lastUsers.push(users[i]);
                    let hasEntered = false;
                    for (var i = 0; i < users.length; i++)
                    {
                        if (users[i]._id == req.session.currentUser._id)
                        {
                            hasEntered = true;
                            break;
                        }
                    }
                    loadSocialPosts(siteModules, req.session.currentUser, { limit : 4 ,tags: challenge.tag }).then((posts) =>
                    {
                        this.renderTemplate(req, res, 'social/social-challenge-single.html', {
                            challenge: challenge,
                            posts : posts,
                            hasEntered: hasEntered,
                            enoughLastUsers: challenge._lastUsers.length > 6,
                        });
                    }).catch(fail);

                }).catch(fail);
            }).catch(fail);
        });
        this.router.get('/:_id/enter', (req, res) =>
        {
            siteModules.SocialChallenge.apiCall('enter-challenge', {
                userToken: req.session.currentUser.token,
                userId: req.session.currentUser._id,
                challengeId: req.params._id,
            }).then((response) =>
            {
                req.session.currentUser = response.user;
                req.session.save(() =>
                {
                    if (isEmptyString(req.query.redirect))
                        res.redirect('/social/challenges/' + response.challenge.slug);
                    else
                        res.redirect(req.query.redirect);
                });
            }).catch((err) =>
            {
                this.show500(req, res, err);
            });
        });
    }
}
const loadSocialPosts = function (siteModules, currentUser, params)
{
    return new Promise((resolve, reject) =>
    {
        siteModules.SocialPost.find(params).then((posts) =>
        {
            for (var i = 0; i < posts.length; i++)
                posts[i] = fixPost(posts[i], currentUser);
            let requiredUsersIds = [];
            for (var i = 0; i < posts.length; i++)
            {
                let has = false;
                for (var j = 0; j < requiredUsersIds.length; j++)
                {
                    if (requiredUsersIds[j] == posts[i].userId)
                    {
                        has = true;
                        break;
                    }
                }
                if (!has)
                    requiredUsersIds.push(posts[i].userId);
            }
            siteModules.User.find({ _ids: requiredUsersIds }).then((users) =>
            {
                for (var i = 0; i < posts.length; i++)
                {
                    for (var j = 0; j < users.length; j++)
                    {
                        if (posts[i].userId == users[j]._id)
                        {
                            posts[i]._user = users[j];
                            break;
                        }
                    }
                }
                resolve(posts);
            });
        }).catch(reject);
    });
}