import SiteRouter from "../site_router";
import { SITE_URL } from "../../constants"
const SLUG = '/dota2-book';
export class Dota2BookRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
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
            this.renderTemplate(req, res, 'dota2book/dota2-book-payment-done.html', {
                msg: req.query.msg,
            });
        });
        this.router.get('/', (req, res) =>
        {
            //check if user can visit this page:
            if (!this.isLoggedIn(req))
            {
                res.redirect('/login');
                return;
            }
            let currentUser = req.session.currentUser;
            if (currentUser.dota2Book2019 == undefined || !currentUser.dota2Book2019.initPayment)
            {
                res.redirect(SLUG + '/eua/?msg=payFirst');
                return;
            }
            //the event page contains current bets,actions +link to other pages + ways to earn more shit this page is quite a lot!
            this.renderTemplate(req, res, 'dota2book/dota2-book-landing.html', {

            });
        });
        // this.router.get('/leaderboard', (req, res) =>
        // {
        //     //list of dota2book gamblers!
        //     this.renderTemplate(req, res, 'dota2book/dota2-book-leaderboard.html', {});
        // });

    }
}