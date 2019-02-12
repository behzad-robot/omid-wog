import Router from "../libs/router";
const fileSystem = require('fs');
const mustache = require('mustache');
const path = require('path');
export default class SiteRouter extends Router
{
    constructor(modules)
    {
        super();
        this.modules = modules;
        //bind functions:
        this.requireLogin = this.requireLogin.bind(this);
        this.renderTemplate = this.renderTemplate.bind(this);
        this.show404 = this.show404.bind(this);
        this.show500 = this.show500.bind(this);
    }
    requireLogin()
    {
        this.router.use((req, res, next) =>
        {
            if (!this.isLoggedIn(req))
            {``
                // this.accessDenied(res);
                res.redirect('/login/?msg=AccessDenied');
                return;
            }
            next();
        });
    }
    isLoggedIn(req)
    {
        // console.log(req.session);
        return req.session.currentUser != undefined && req.session.currentUser._id != undefined;
    }
    checkLogin(req,res)
    {
        var login = this.isLoggedIn(req);
        if(!login)
            res.redirect('/login/?msg=AccessDenied');
        return login;
    }
    renderTemplate(req,res,fileName, data={})
    {
        if (!fileName.includes("public/"))
            fileName = "public/" + fileName;
        try
        {
            let view_str = fileSystem.readFileSync(path.resolve(fileName)).toString();
            //cache related things:
            this.modules.Cache.allGames.getData((err,games)=>{
                if(err)
                {
                    res.send("Error="+err.toString());
                    return;
                }
                data.currentUser = req.session ? req.session.currentUser : undefined;
                data.head = mustache.render(fileSystem.readFileSync(path.resolve('public/head.html')).toString(),data);
                data.navbar = mustache.render(fileSystem.readFileSync(path.resolve('public/navbar.html')).toString(),data);
                data.footer = mustache.render(fileSystem.readFileSync(path.resolve('public/footer.html')).toString(),data);
                res.send(mustache.render(view_str, data));
            });            
        } catch (err)
        {
            res.send("render file failed =>" + err);
        }
    }
    show404(req,res){
        this.renderTemplate(req,res,"404.html");
    }
    show500(req,res,err){
        this.renderTemplate(req,res,"404.html",{
            error : err
        });
    }
}