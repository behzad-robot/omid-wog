import SiteRouter from "../site_router";
const fs = require('fs');
export class WogTournamentsRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.get('/fortnite', (req, res) =>
        {
            this.renderTemplate(req, res, 'tournaments-landing/fortnite-wog-tournament.html');
        });
        this.router.get('/epicenter', (req, res) =>
        {
            this.renderTemplate(req, res, 'tournaments-landing/epicenter-wog-tournament.html');
        });
        this.router.get('/esl1', (req, res) =>
        {
            this.renderTemplate(req, res, 'tournaments-landing/esl1-wog-tournament.html');
        });
    }
}