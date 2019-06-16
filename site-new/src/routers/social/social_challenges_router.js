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
                    let hasEntered = false;
                    for (var i = 0; i < users.length; i++)
                    {
                        if (users[i]._id == req.session.currentUser._id)
                        {
                            hasEntered = true;
                            break;
                        }
                    }
                    this.renderTemplate(req, res, 'social/social-challenge-single.html', {
                        challenge: challenge,
                        hasEntered: hasEntered,
                    });
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