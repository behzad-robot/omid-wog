import SiteRouter from "./site_router";

export default class SiteUsersRouter extends SiteRouter {
    constructor(siteModules) {
        super(siteModules);
        this.router.get('/:username', (req, res) => {
            siteModules.User.find({ username: req.params.username }).then((users) => {
                if(users.length == 0)
                {
                    this.show404(req,res);
                    return;
                }
                let user = siteModules.User.public(users[0]);
                this.renderTemplate(req,res,'user-profile.html',{
                    user : user,
                    isCurrentUser : (user._id == req.session.currentUser._id ? true : undefined )
                });
            }).catch((err)=>{
                this.show500(req,res,err);
            });
        });
    }
}