import Router from "../libs/router";
import { SITE_URL } from "../constants";
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
            {
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
    checkLogin(req, res)
    {
        var login = this.isLoggedIn(req);
        if (!login)
            res.redirect('/login/?msg=AccessDenied');
        return login;
    }
    renderTemplate(req, res, fileName, data = {})
    {
        if (!fileName.includes("public/"))
            fileName = "public/" + fileName;
        try
        {
            let view_str = fileSystem.readFileSync(path.resolve(fileName)).toString();
            //functions:
            data.SITE_URL = function ()
            {
                return function (val, render)
                {
                    return render(SITE_URL(val));
                }
            };
            //add shared data:
            data._wogSEO = this.modules.getConfig().seo;
            data._wogSEO.fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
            data.navbarData = {
                games: [],
                tutorials: [],
                news: [],
            };
            //actually load navbarData => step 1 : games
            this.modules.Cache.allGames.getData((err, navGames) =>
            {
                if (err)
                {
                    this.show500(req, res, err.toString());
                    return;
                }
                data.navbarData.games = navGames;
                //step 2 => posts + cats:
                this.modules.Cache.navbarNews.getData((err, navCats) =>
                {
                    if (err)
                    {
                        this.show500(req, res, err.toString());
                        return;
                    }
                    data.navbarData.news = navCats;
                    this.modules.Cache.navbarTutorials.getData((err, navCats) =>
                    {
                        if (err)
                        {
                            this.show500(req, res, err.toString());
                            return;
                        }
                        data.navbarData.tutorials = navCats;
                    });
                    console.log(JSON.stringify(data));
                    //navbar is all ready => add shared html parts:
                    data.footer = mustache.render(fileSystem.readFileSync(path.resolve('public/footer.html')).toString(), {});
                    data.currentUser = req.session ? req.session.currentUser : undefined;
                    data.head = mustache.render(fileSystem.readFileSync(path.resolve('public/head.html')).toString(), data);
                    data.navbar = mustache.render(fileSystem.readFileSync(path.resolve('public/navbar.html')).toString(), data);
                    res.send(mustache.render(view_str, data));
                });
            });
        } catch (err)
        {
            res.send("render file failed =>" + err);
        }
    }
    show404(req, res)
    {
        this.renderTemplate(req, res, "404.html");
    }
    show500(req, res, err)
    {
        console.log("ERROR 500 => " + req.originalUrl + " => " + err);
        res.send(err);
        // this.renderTemplate(req,res,"404.html",{
        //     error : err
        // });
    }
}