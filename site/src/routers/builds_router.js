import SiteRouter from "./site_router";

export default class SiteBuildsRouter extends SiteRouter {
    constructor(siteModules) {
        super(siteModules);
        this.router.get('/', (req, res) => {
            this.renderTemplate(req, res, 'builds-archive.html', {
                query : JSON.stringify(req.query)
            });
        });
        this.router.get('/:buildId', (req, res) => {
            const buildId = req.params.buildId;
            console.log(buildId);
            this.renderTemplate(req, res, 'build-single.html', {
                buildId: buildId,
                _id: buildId,
            });
        });
        this.router.post('/:buildId/new-comment', (req, res) => {
            if(!this.checkLogin(req,res))
                return;
            siteModules.Build.getOne(req.params.buildId).then((build) => {
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
                    body: req.body.body,
                    createdAt: this.now(),
                });
                siteModules.Build.edit(build._id, { comments: build.comments }).then((b) => {
                    res.redirect('/builds/' + b._id);
                }).catch((err) => {
                    console.log(err);
                    this.show500(req, res, err.toString());
                });
            }).catch((err) => {
                console.log(err);
                this.show500(req, res, err.toString());
            });
        });
        this.router.post('/:buildId/vote',(req,res)=>{
            if((req.body.token == undefined || req.body.token == '') || req.body.vote == undefined)
            {
                res.send({error: "parameters missing!"});
                return;
            }
            console.log(req.body.token);
            siteModules.User.checkToken(req.body.token).then((result)=>{
                if(typeof result == 'string')
                    result = JSON.parse(result);
                if(result.valid)
                {
                    const vote = req.body.vote;
                    const userId = result.user._id;
                    console.log(req.params.buildId);
                    siteModules.Build.getOne(req.params.buildId).then((build)=>{
                        if(vote == 1)
                        {
                            var had = false;
                            for(var i = 0 ; i < build.upVotes.length;i++)
                            {
                                if(build.upVotes[i] == userId)
                                {
                                    had =  true;
                                    build.upVotes.splice(i,1);
                                    break;
                                }
                            }
                            if(!had)
                                build.upVotes.push(userId);
                            for(var i = 0 ; i < build.downVotes.length;i++)
                            {
                                if(build.downVotes[i] == userId)
                                {
                                    build.downVotes.splice(i,1);
                                    break;
                                }
                            }
                        }
                        else if(vote == -1)
                        {
                            for(var i = 0 ; i < build.upVotes.length;i++)
                            {
                                if(build.upVotes[i] == userId)
                                {
                                    build.upVotes.splice(i,1);
                                    break;
                                }
                            }
                            var had = false;
                            for(var i = 0 ; i < build.downVotes.length;i++)
                            {
                                if(build.downVotes[i] == userId)
                                {
                                    had =  true;
                                    build.downVotes.splice(i,1);
                                    break;
                                }
                            }
                            if(!had)
                                build.downVotes.push(userId);
                        }
                        siteModules.Build.edit( build._id , {upVotes : build.upVotes , downVotes : build.downVotes}).then((b)=>{
                            res.send({succcess : true , build : b});
                        }).catch((err)=>{
                            res.send({error: err});    
                        });
                    }).catch((err)=>{
                        res.send({error: err});
                    });
                }
                else
                {
                    res.send({error:"access denied!"});
                }
            }).catch((err)=>{
                res.send(err);
            });
        });
    }
}