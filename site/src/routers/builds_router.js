import SiteRouter from "./site_router";

export default class SiteBuildsRouter extends SiteRouter {
    constructor(siteModules) {
        super(siteModules);
        this.router.get('/:buildId', (req, res) => {
            this.renderTemplate(req, res, 'build-single.html', {
                _id: req.params.buildId,
            });
        });
        this.router.post('/:buildId/new-comment', (req, res) => {
            if(!this.checkLogin(req,res))
                return;
            console.log("login check ok looking for build "+req.params.buildId);
            siteModules.Build.getOne(req.params.buildId).then((build) => {
                console.log("build is real!");
                //make id:
                var maxId = -1;
                for (var i = 0; i < build.comments.length; i++) {
                    if (build.comments[i]._id >= maxId)
                        maxId = build.comments[i]._id;
                }
                maxId++;
                //make comment:
                build.comments.push({
                    _id: maxId,
                    userId: req.session.currentUser._id,
                    body: req.body,
                    createdAt: this.now(),
                });
                console.log("ok we have the comment in right?");
                siteModules.Build.edit(build._id, { comments: build.comments }).then((b) => {
                    res.send(b);
                    // res.redirect('/builds/' + b._id);
                }).catch((err) => {
                    console.log(err);
                    res.send(err);
                    // this.show500(req, res, err.toString());
                });
            }).catch((err) => {
                console.log(err);
                res.send(err);
                // this.show500(req, res, err.toString());
            });
        });
    }
}