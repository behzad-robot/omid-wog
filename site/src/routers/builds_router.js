import SiteRouter from "./site_router";

export default class SiteBuildsRouter extends SiteRouter {
    constructor(siteModules) {
        super(siteModules);
        this.router.get('/:buildId', (req, res) => {
           this.renderTemplate(req,res,'build-single.html',{
               _id : req.params.buildId,
           });
        });
    }
}