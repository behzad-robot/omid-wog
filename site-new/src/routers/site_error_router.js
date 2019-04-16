import SiteRouter from "./site_router";
const fs = require('fs');
const path = require('path');
export default class SiteErrorRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.use('*', (req, res) =>
        {
            this.show404(req, res);
        });

    }
}