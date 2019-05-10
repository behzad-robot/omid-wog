import SiteRouter from "./site_router";
import { isEmptyString } from '../utils/utils';
import { SITE_URL } from "../constants";
const nodemailer = require('nodemailer');
export default class SiteTournamentRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.get('/', (req, res) =>
        {
            siteModules.Cache.getPostCat({ slug: 'tournaments' }).then((cat) =>
            {
                siteModules.Post.find({ categories: cat._id, limit: 6 }).then((posts) =>
                {
                    this.renderTemplate(req, res, 'tournoments-list.html', {
                        posts: posts,
                    });
                }).catch((err) =>
                {
                    this.show500(req, res, err);
                });;
            }).catch((err) =>
            {
                this.show500(req, res, err);
            });
        });
        this.router.get('/fortnite-2019', (req, res) =>
        {
            this.renderTemplate(req, res, 'fortnite-tournament.html', {});
        });
        this.router.get('/fortnite-2019-list', (req, res) =>
        {
            siteModules.User.find({ 'fortnite2019.hasJoined': true , limit : 50000  }).then((players) =>
            {
                this.renderTemplate(req, res, 'fortnite-tournament-list.html', {
                    players: players,
                });
            }).catch((err) =>
            {
                this.show500(req, res, err.toString());
            });
        });
        this.router.get('/fortnite-2019-join', (req, res) =>
        {
            if (!this.isLoggedIn(req))
            {
                res.redirect('/login');
                return;
            }
            let currentUser = req.session.currentUser;
            if (currentUser.fortnite2019 != undefined &&
                currentUser.fortnite2019.hasJoined)
            {
                res.redirect('/tournaments/fortnite-2019-status/');
                return;
            }
            siteModules.User.apiCall('join-fortnite-2019', { userToken: req.session.currentUser.token }).then((user) =>
            {
                req.session.currentUser = user;
                req.session.save(() =>
                {
                    res.redirect('/tournaments/fortnite-2019-status/');
                });
            }).catch((err) =>
            {
                res.redirect('/tournaments/fortnite-2019-status/?error=' + err.toString());
            });
        });
        this.router.get('/fortnite-2019-status', (req, res) =>
        {
            if (req.query.error == 'epicGamesID and psnID are both empty')
                req.query.error = 'آیدی اپیک گیمز یا PSN خود را برای ورود به مسابقه وارد کنید. به بخش ویرایش اطلاعات کاربری بروید.'
            this.renderTemplate(req, res, 'fortnite-tournament-message.html', {
                error: req.query.error,
            });
        });
    }
}