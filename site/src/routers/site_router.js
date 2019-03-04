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
            // console.log("load all games from cache");
            //cache related things:
            this.modules.Cache.allGames.getData((err, games) =>
            {
                if (err)
                {
                    res.send("Error=" + err.toString());
                    return;
                }
                // console.log('all games count=>' + games.length);
                data.allGames = games;
                this.modules.Cache.navbarPosts.getData((err, navbarPosts) =>
                {
                    data.navbarPosts = navbarPosts;
                    data.currentUser = req.session ? req.session.currentUser : undefined;
                    data.head = mustache.render(fileSystem.readFileSync(path.resolve('public/head.html')).toString(), data);
                    data.navbar = mustache.render(fileSystem.readFileSync(path.resolve('public/navbar.html')).toString(), data);
                    this.modules.Cache.footerPosts.getData((err, footerPosts) =>
                    {
                        if (err)
                        {
                            this.show500(req, res, err);
                            return;
                        }
                        this.modules.Cache.footerMedia.getData((err, footerMedia) =>
                        {
                            if (err)
                            {
                                this.show500(req, res, err);
                                return;
                            }
                            data.footer = mustache.render(fileSystem.readFileSync(path.resolve('public/footer.html')).toString(), {
                                footerPosts : footerPosts,
                                footerMedia : footerMedia,
                            });
                            data.SITE_URL = function (){
                                return function(val,render){
                                    return render(SITE_URL(val));
                                }
                            };
                            console.log("parts readY!");
                            // console.log(Date.now()-data._t);
                            data._wogSEO = this.modules.getConfig().seo;
                            data._wogSEO.fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
                            // console.log(data._wogSEO);
                            res.send(mustache.render(view_str, data));
                        });
                    });
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