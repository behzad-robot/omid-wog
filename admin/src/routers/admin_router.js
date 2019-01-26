import Router from '../libs/router';

const fileSystem = require('fs');
const path = require('path');
const mustache = require('mustache');
export class AdminRouter extends Router
{
    constructor()
    {
        super();
        //bind functions:
        this.requireAdmin = this.requireAdmin.bind(this);
        this.renderTemplate = this.renderTemplate.bind(this);
    }
    requireAdmin()
    {
        this.router.use((req, res, next) =>
        {
            if (!req.session.isAdmin || req.session.adminToken == undefined)
            {
                this.accessDenied(res);
                return;
            }
            next();
        });
    }
    renderTemplate = (fileName, data = {}) =>
    {
        if (!fileName.includes("public/"))
            fileName = "public/" + fileName;
        try
        {
            let view_str = fileSystem.readFileSync(path.resolve(fileName)).toString();
            data.head = fileSystem.readFileSync(path.resolve('public/head.html'));
            data.actionbar = fileSystem.readFileSync(path.resolve('public/nav-bar.html'));
            data.footer = fileSystem.readFileSync(path.resolve('public/footer.html'));
            return mustache.render(view_str, data);
        } catch (err)
        {
            return "render file failed =>" + err;
        }
    }
    
}