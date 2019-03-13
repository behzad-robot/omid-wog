import SiteRouter from "./site_router";
import { resolveSoa } from "dns";

export default class SiteAuthRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.get('/login', (req, res) =>
        {
            let error = req.query.msg;
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
            if (req.body.username == '')
            {
                res.redirect('/login/?msg=enter-username');
                return;
            }
            if (req.body.password == '')
            {
                res.redirect('/login/?msg=enter-password');
                return;
            }
            console.log(req.query);
            const query = {
                password: req.body.password,
            }
            if (req.body.username.indexOf("@") == -1)
                query.username = req.body.username;
            else
                query.email = req.body.username;
            siteModules.User.apiCall('login', query).then((user) =>
            {
                if (typeof user == 'string')
                    user = JSON.parse(user);
                if (user.error == undefined)
                {
                    user = siteModules.User.fixOne(user);
                    req.session.currentUser = user;
                    req.session.currentUserToken = user.token;
                    req.session.save(() =>
                    {
                        res.redirect(`/users/${user.username}`);
                    });
                }
                else
                {
                    res.redirect('/login/?msg=user-not-found');
                }
            }).catch((err) =>
            {
                if (typeof err == 'object')
                    err = JSON.stringify(err);
                res.redirect('/login/?msg=' + err.toString());
            });
        });
        this.router.all('/logout', (req, res) =>
        {
            req.session.destroy(() =>
            {
                res.redirect('/');
            });
        });
        this.router.get('/forget-password', (req, res) =>
        {
            var error = undefined;
            this.renderTemplate(req, res, 'forget-password.html', {
                msg: error ? { error: error } : undefined,
            });
        });
        this.router.get('/signup', (req, res) =>
        {
            let error = req.query.msg;
            this.renderTemplate(req, res, 'signup.html', {
                msg: error ? { error: error } : undefined,
            });
        });
        this.router.get('/signup-success', (req, res) =>
        {
            this.renderTemplate(req, res, 'signup-success.html', {
            });
        });
        this.router.get('/signup-check-unique', (req, res) =>
        {
            //req.query may containt email AND OR username AND OR phoneNumber
            console.log(req.query);
            siteModules.User.find(req.query).then((users) =>
            {
                if (users == null || users.length == 0)
                    res.send({ available: true });
                else
                    res.send({ available: false });
            }).catch((err) =>
            {
                res.send({ available: true });
            });
        });
        this.router.post('/signup', (req, res) =>
        {
            if (req.body.username == undefined || req.body.username.replace(' ', '') == '')
            {
                res.redirect('/signup/?msg=enter-username');
                return;
            }
            if (req.body.firstName == undefined || req.body.firstName.replace(' ', '') == '')
            {
                res.redirect('/signup/?msg=enter-firstName');
                return;
            }
            if (req.body.lastName == undefined || req.body.lastName.replace(' ', '') == '')
            {
                res.redirect('/signup/?msg=enter-lastName');
                return;
            }
            if (req.body.phoneNumber == undefined || req.body.phoneNumber.replace(' ', '') == '')
            {
                res.redirect('/signup/?msg=enter-phoneNumber');
                return;
            }
            if ((req.body.password == undefined || req.body.password.replace(' ', '') == '') || (req.body.confirmPassword == undefined || req.body.confirmPassword.replace(' ', '') == ''))
            {
                res.redirect('/signup/?msg=enter-password');
                return;
            }
            if (req.body.password != req.body.confirmPassword)
            {
                res.redirect('/signup/?msg=password-match');
                return;
            }
            const data = {
                username: req.body.username,
                password: req.body.password,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                phoneNumber: req.body.phoneNumber,
                email: req.body.email ? req.body.email : '',
                city: req.body.city ? req.body.city : '',
                age: req.body.age ? req.body.age : '',
                sex: req.body.sex ? req.body.sex : '',
            };
            siteModules.User.apiCall('signup', data).then((user) =>
            {
                if (typeof user == 'string')
                    user = JSON.parse(user);
                if (user.error == undefined)
                {
                    user = siteModules.User.fixOne(user);
                    req.session.currentUser = user;
                    req.session.currentUserToken = user.token;
                    req.session.save(() =>
                    {
                        res.redirect('/signup-success');
                    });
                }
                else
                    res.redirect('/signup/?msg=' + user.error);
            }).catch((err) =>
            {
                console.log("err=" + err);
                res.redirect('/signup/?msg=' + err.toString());
            });
        });
    }
}