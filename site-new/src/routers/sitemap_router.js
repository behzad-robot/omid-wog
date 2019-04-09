import SiteRouter from "./site_router";
const fs = require('fs');
const path = require('path');
export default class SiteMapRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.get('/sitemap', (req, res) =>
        {
            fs.readFile(path.resolve('../storage/sitemap.txt'), (err, data) =>
            {
                if (err)
                {
                    this.show500(req, res, err.toString());
                    return;
                }
                res.status(200).send(data.toString());
            });
        });
    }
}