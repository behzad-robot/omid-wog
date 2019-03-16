import SiteRouter from "./site_router";

export default class SiteGeneralRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.get('/home', (req, res) =>
        {
            siteModules.Post.find({ limit: 5 }).then((latestPosts) =>
            {
                console.log('latestPosts');
                console.log(latestPosts.length);
                this.renderTemplate(req, res, 'wog-home.html', {
                    latestPosts: latestPosts
                });
            });
        });
        this.router.get('/html/:fileName', (req, res) =>
        {
            this.renderTemplate(req, res, req.params.fileName + '.html', {});
        });
        this.router.get('/*', (req, res) =>
        {
            this.renderTemplate(req, res, 'dushvari.html', {});
        });
    }
}