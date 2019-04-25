import SiteRouter from "./site_router";
import { isEmptyString } from '../utils/utils';
import { SITE_URL } from "../constants";
const nodemailer = require('nodemailer');
export default class SiteTournamentRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.get('/', (req, res) =>
        {
            siteModules.Cache.getPostCat({ slug: 'tournaments' }).then((cat) =>
            {
                siteModules.Post.find({ categories: cat._id, limit: 6 }).then((posts) =>
                {
                    this.renderTemplate(req, res, 'tournoments-list.html', {
                        posts: posts,
                    });
                }).catch((err) =>
                {
                    this.show500(req, res, err);
                });;
            }).catch((err) =>
            {
                this.show500(req, res, err);
            });
        });
        this.router.get('/fortnite-2019', (req, res) =>
        {
            this.renderTemplate(req, res, 'fortnite-tournamet.html', {});
        });
    }
}