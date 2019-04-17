import SiteRouter from "../site_router";
import { SITE_URL } from "../../constants";

export class GeneralWikiRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.get('/', (req, res) =>
        {
            this.renderTemplate(req, res, 'wiki-home/wiki-home.html', {});
        });

    }
}