import SiteRouter from "./site_router";

export default class SiteGeneralRouter extends SiteRouter
{
    constructor(modules)
    {
        super(modules);
        this.router.get('/', (req, res) =>
        {
            this.renderTemplate(req, res, 'wog-home.html', {});
        });
        this.router.get('/shop', (req, res) =>
        {
            this.renderTemplate(req, res, 'coming-soon.html', {});
        });
        // this.router.get('/html/:fileName', (req, res) =>
        // {
        //     this.renderTemplate(req, res, req.params.fileName + '.html', {});
        // });
    }
}