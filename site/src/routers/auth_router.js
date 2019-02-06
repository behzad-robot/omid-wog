import SiteRouter from "./site_router";
import { resolveSoa } from "dns";

export default class SiteAuthRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.get('/login', (req, res) =>
        {
            var error = undefined;
            if (req.query.msg == 'user-not-found')
                error = "کاربری با این مشخصات یافت نشد."
            else
                error = req.query.msg;
            this.renderTemplate(req, res, 'login.html', {
                msg: error ? { error: error } : undefined,
            });
        });
        this.router.post('/login', (req, res) =>
        {
            if (req.body.username == undefined || req.body.password == undefined)
            {
                res.send("Parameters Missing!");
                return;
            }
            const query = {
                password: req.body.password,
            }
            if (req.body.username.indexOf("@") == -1)
                query.username = req.body.username;
            else
                query.email = req.body.username;
            siteModules.User.apiCall('/login', 'POST', query).then((user) =>
            {
                if (typeof user == 'string')
                    user = JSON.parse(user);
                if (user.error == undefined)
                {
                    req.session.currentUser = user;
                    req.session.currentUserToken = user.token;
                    req.session.save(() =>
                    {
                        res.redirect('/');
                    });
                }
                else
                {
                    res.redirect('/login/?msg=user-not-found');
                }
            }).catch((err) =>
            {
                if (typeof err == 'string')
                    err = JSON.parse(err);
                res.redirect('/login/?msg=' + err.error);
            });
        });
        this.router.all('/logout', (req, res) =>
        {
            req.session.destroy(() =>
            {
                res.redirect('/');
            });
        });
    }
}