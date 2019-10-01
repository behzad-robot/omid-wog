
import { AdminRouter } from "./admin_router";
import { IS_LOCALHOST } from "../constants";

export default class AdminGeneralRouter extends AdminRouter
{
    constructor(adminModules)
    {
        super();
        const User = adminModules.User;
        this.router.get('/', (req, res) =>
        {
            res.send(this.renderTemplate('welcome.html'));
            // res.status(200).send(this.renderTemplate('socket.html', { _id: req.params._id , ws_url : IS_LOCALHOST() ? 'ws://localhost:4040': 'ws://determination.ir:4040'}));
        });
        this.router.get('/admin/login', (req, res) =>
        {
            res.send(this.renderTemplate('login.html'));
        });
        this.router.get('/admin/logout', (req, res) =>
        {
            req.session.destroy((err) =>
            {
                res.redirect('/');
            });
        });
        this.router.post('/admin/check-login', (req, res) =>
        {
            var data = {
                password: req.body.password,
            };
            if (req.body.email.indexOf('@') != -1)
                data.email = req.body.email;
            else
                data.username = req.body.email;
            User.apiCall('login/', 'POST', data).then((user) =>
            {
                user = JSON.parse(user);
                user = user._data;
                if (user.accessLevel == undefined || !user.accessLevel.isAdmin)
                {
                    res.send({ error: "Access To Admin Panel Denied", code: 400, user: user });
                    return;
                }
                if (user._id)
                {
                    req.session.isAdmin = true;
                    req.session.adminToken = user.token;
                    req.session.admin = user;
                    req.session.save(() =>
                    {
                        res.redirect('/admin/');
                    });
                }
                else
                    res.send(user);
            }).catch((err) =>
            {
                res.send({ error: err.toString(), code: 500 });
            });
        });
    }
}