import SiteRouter from "../site_router";
const path = require('path');
const fs = require('fs');
const TWITCH_FILE = path.resolve('../storage/ti9/twitch.txt');
const TEAMS_FILE = path.resolve('../storage/ti9/teams.json');
const MATCHES_FILE = path.resolve('../storage/ti9/matches.json');
export class TI9Router extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.get('/', (req, res) =>
        {
            var picks = [];
            if (req.session != undefined && req.session.currentUser != undefined)
                picks = req.session.currentUser.ti9.picks;
            let twitch = fs.readFileSync(TWITCH_FILE).toString();
            let teams = JSON.parse(fs.readFileSync(TEAMS_FILE).toString());
            let matches = JSON.parse(fs.readFileSync(MATCHES_FILE).toString());
            let pickNames = [];
            for (var i = 0; i < picks.length; i++)
            {
                for (var j = 0; j < teams.length; j++)
                {
                    if (picks[i] == teams[j].token)
                    {
                        pickNames[i] = teams[j].name;
                        break;
                    }
                }
            }
            if (pickNames.length == 0)
            {
                pickNames = ['', '', '', ''];
            }
            this.renderTemplate(req, res, 'ti9/ti9-home.html', {
                picks,
                pickNames,
                twitch,
                teams,
                matches,
                canPick : picks.length == 0,
            });
        });
        this.router.post('/submit-picks', (req, res) =>
        {
            if (!this.isLoggedIn(req))
            {
                this.show500(req, res, 'you are not logged in!');
                return;
            }
            req.body.picks = JSON.parse(req.body.picks);
            siteModules.User.edit(req.session.currentUser._id, {
                ti9: {
                    picks: req.body.picks,
                    updatedAt: this.now(),
                }
            }).then((user) =>
            {
                req.session.currentUser = user;
                req.session.save(() =>
                {
                    res.redirect('/ti9/');
                });
            }).catch((err) =>
            {
                this.show500(req, res, err);
            });
        });
        this.router.get('/admin', (req, res) =>
        {
            if (!this.isLoggedIn(req))
            {
                this.show500(req, res, 'access denied');
                return;
            }
            if (!req.session.currentUser.accessLevel.isAdmin)
            {
                this.show500(req, res, 'access denied');
                return;
            }
            let twitch = fs.readFileSync(TWITCH_FILE).toString();
            let teams = (fs.readFileSync(TEAMS_FILE).toString());
            let matches = (fs.readFileSync(MATCHES_FILE).toString());
            this.renderTemplate(req, res, 'ti9/admin.html', {
                twitch,
                teams,
                matches,
            })
        });
        this.router.post('/admin/save', (req, res) =>
        {
            if (!this.isLoggedIn(req))
            {
                this.show500(req, res, 'access denied');
                return;
            }
            if (!req.session.currentUser.accessLevel.isAdmin)
            {
                this.show500(req, res, 'access denied');
                return;
            }
            fs.writeFileSync(TWITCH_FILE, req.body.twitch);
            fs.writeFileSync(TEAMS_FILE, req.body.teams);
            fs.writeFileSync(MATCHES_FILE, req.body.matches);
            res.redirect('/ti9/admin');
        });
    }
}