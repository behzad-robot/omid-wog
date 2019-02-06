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
    }
    requireLogin()
    {

    }
    renderTemplate(req,res,fileName, data)
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
                data.currentUser = req.session.currentUser;
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
}