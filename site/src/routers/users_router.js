import SiteRouter from "./site_router";
import { isEmptyString } from "../utils/utils";

export default class SiteUsersRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.get('/:username', (req, res) =>
        {
            siteModules.User.find({ username: req.params.username }).then((users) =>
            {
                if (users.length == 0)
                {
                    this.show404(req, res);
                    return;
                }
                let user = siteModules.User.public(users[0]);
                this.renderTemplate(req, res, 'user-profile.html', {
                    user: user,
                    isCurrentUser: ((req.session != undefined && req.session.currentUser != undefined && user._id == req.session.currentUser._id) ? true : undefined)
                });
            }).catch((err) =>
            {
                this.show500(req, res, err);
            });
        });
        this.router.get('/:username/edit', (req, res) =>
        {
            if (!this.isLoggedIn(req) || req.session.currentUser.username != req.params.username)
            {
                res.send("Access Denied");
                return;
            }
            this.renderTemplate(req, res, 'user-edit.html', {
                user: req.session.currentUser,
            });
        });
        this.router.post('/:username/edit', (req, res) =>
        {
            if (isEmptyString(req.body._id) || isEmptyString(req.body.username) || isEmptyString(req.body.phoneNumber)
                || isEmptyString(req.body.firstName) || isEmptyString(req.body.lastName))
            {
                res.send("Parameters missing!");
                return;
            }
            if (req.body._id != req.session.currentUser._id)
            {
                res.send("Editing Other user! Access denied!");
                return;
            }
            if (req.body.password != req.body.confirmPassword)
            {
                res.send("Passwords not matching!");
                return;
            }
            const data = {
                username : req.body.username,
                password : req.body.password,
                phoneNumber : req.body.phoneNumber,
                email : req.body.email,
                password : req.body.password,
                firstName : req.body.firstName,
                lastName : req.body.lastName,
                city : req.body.city,
                sex : req.body.sex,
                age : req.body.age,
            };
            siteModules.User.edit(req.body._id , data).then((user)=>{
                user = siteModules.User.fixOne(user);
                req.session.currentUser = user;
                req.session.save(()=>{
                    res.redirect(`/users/${user.username}/edit/?msg=success`);
                });
            });
        });
    }
}