
import { AdminRouter } from "./admin_router";
import { IS_LOCALHOST } from "../constants";

export default class AdminGeneralRouter extends AdminRouter
{
    constructor(AdminModel)
    {
        super();
        const Admin = AdminModel;
        this.router.get('/', (req, res) =>
        {
            res.send(this.renderTemplate('welcome.html'));
            // res.status(200).send(this.renderTemplate('socket.html', { _id: req.params._id , ws_url : IS_LOCALHOST() ? 'ws://localhost:4040': 'ws://determination.ir:4040'}));
        });
        this.router.get('/admin/login', (req, res) =>
        {
            res.send(this.renderTemplate('login.html'));
        });
        this.router.post('/admin/check-login', (req, res) =>
        {
            Admin.apiCall('login/', 'POST',
                {
                    email: req.body.email,
                    password: req.body.password,
                }).then((user) =>
                {
                    user = JSON.parse(user);
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