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
        this.accessDenied = this.accessDenied.bind(this);
        this.hasPermission = this.hasPermission.bind(this);
    }
    requireAdmin()
    {
        this.router.use((req, res, next) =>
        {
            if (!req.session.isAdmin || req.session.adminToken == undefined)
            {
                // this.accessDenied(res);
                res.redirect('/admin/login/?msg=AccessDenied');
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
            data.actionbar = mustache.render(fileSystem.readFileSync(path.resolve('public/nav-bar.html')).toString(), data);
            data.footer = fileSystem.readFileSync(path.resolve('public/footer.html'));
            data.file_screen = mustache.render(fileSystem.readFileSync(path.resolve('public/file-explorer-screen.html')).toString(), data);
            return mustache.render(view_str, data);
        } catch (err)
        {
            return "render file failed =>" + err;
        }
    }
    hasPermission(req, permission)
    {
        let admin = req.session.admin;
        for (var i = 0; i < admin.accessLevel.permissions.length; i++)
        {
            if (admin.accessLevel.permissions[i] == permission || admin.accessLevel.permissions[i] == 'super')
                return true;
        }
        return false;
    }
    accessDenied(req, res,extraError = '')
    {
        res.send(this.renderTemplate('access-denied.html', {
            admin: req.session.admin,
            extraError : extraError,
        }));
    }
}