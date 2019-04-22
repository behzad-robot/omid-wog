
import { AdminRouter } from "./admin_router";
import { API_URL, ADMIN_FILE_UPLOAD, ADMIN_FILE_UPLOAD_NEW } from "../constants";
import { updateCache } from "../utils/cache";
export default class GamesPanelRouter extends AdminRouter
{
    constructor(AdminModules)
    {
        super();
        const Admin = AdminModules.Admin;
        const Game = AdminModules.Game;
        const AdminLog = AdminModules.AdminLog;
        this.requireAdmin();
        this.router.use((req, res, next) =>
        {
            // console.log(req.url);
            if (req.url.indexOf('edit') != -1 || req.url.indexOf('new') != -1 || req.url.indexOf('delete') != -1)
            {
                updateCache('all-games'); //deprecated legacy site
                updateCache('games-all');
            }
            if (!this.hasPermission(req, 'games') && !this.hasPermission(req,'games-super'))
            {
                this.accessDenied(req,res,'you cant access games part');
                return;
            }
            if (req.url.indexOf('edit') != -1 || req.url.indexOf('delete') != -1)
            {
                let action = 'games-?';
                if (req.url.indexOf('edit') != -1)
                    action = 'games-edit';
                else if(req.url.indexOf('delete') != -1)
                    action = 'games-delete';
                AdminLog.insert({
                    userId: req.session.admin._id,
                    title: action ,
                    url : req.url,
                    postBody : req.method == 'POST' ? req.body : {}, 
                }).then((result)=>{
                    console.log(result);
                    console.log('=======');
                }).catch((err)=>{
                    console.log(err);
                });
            }
            next();
        });
        this.router.get('/', (req, res) =>
        {
            res.send(this.renderTemplate('games-list.html', {
                admin: req.session.admin
            }));
        });
        this.router.get('/new', (req, res) =>
        {
            Game.insert({
                name: 'New Game',
            }).then((result) =>
            {
                if (result._id)
                    res.redirect('/admin/games/' + result._id + '/');
                else
                    res.send(result);
            }).catch((err) =>
            {
                res.send(err);
            });
        });
        this.router.get('/:_id/delete', (req, res) =>
        {
            Game.delete(req.params._id).then((result) =>
            {
                res.send('<p>Item Delete Result</p>' + JSON.stringify(result) + '<br><br><a href="/admin/games/">Back to Games</a>');
            }).catch((err) =>
            {
                res.send(err);
            });
        });
        this.router.post('/:_id/edit', (req, res) =>
        {
            if (req.body._id == undefined)
            {
                res.send({ error: "Missing _id", code: 500 });
                return;
            }
            // console.log(req.body);
            req.body._draft = req.body._draft == 'on' ? true : false;
            req.body.images = JSON.parse(req.body.images);
            // req.body.media = JSON.parse(req.body.media);
            if (req.body.items)
            {
                req.body.items = JSON.parse(req.body.items);
                if (req.body.summonerSpells && req.body.summonerSpells != '')
                    req.body.summonerSpells = JSON.parse(req.body.summonerSpells);
                if (req.body.runes && req.body.runes != '')
                    req.body.runes = JSON.parse(req.body.runes);
                req.body.patchNotes = JSON.parse(req.body.patchNotes);
            }
            else if(req.body.token.indexOf('mortal') != -1)
            {
                req.body.factions = JSON.parse(req.body.factions);
            }
            if(req.body.token == 'pubg')
            {
                console.log(req.body.weapons);
                req.body.maps = JSON.parse(req.body.maps);
                req.body.consumables = JSON.parse(req.body.consumables);
                req.body.equipments = JSON.parse(req.body.equipments);
                req.body.ammunations = JSON.parse(req.body.ammunations);
                req.body.attachmentCategories = JSON.parse(req.body.attachmentCategories);
                req.body.attachments = JSON.parse(req.body.attachments);
                req.body.weaponCategories = JSON.parse(req.body.weaponCategories);
                req.body.weapons = JSON.parse(req.body.weapons);
                console.log(req.body.weapons);
            }
            const _id = req.body._id;
            delete (req.body._id);
            Game.edit(_id, req.body).then((result) =>
            {
                console.log(result);
                res.redirect('/admin/games/' + _id + '/?edit=success');
            }).catch((err) =>
            {
                res.send(err);
            });
        });
        this.router.get('/:_id', (req, res) =>
        {
            Game.getOne(req.params._id).then((g) =>
            {
                if (g.token != 'pubg')
                {
                    res.send(this.renderTemplate('game-single.html', {
                        admin: req.session.admin,
                        _id: req.params._id,
                        fileUploadURL: ADMIN_FILE_UPLOAD
                    }));
                }
                else
                {
                    res.send(this.renderTemplate('game-pubg-single.html', {
                        admin: req.session.admin,
                        _id: req.params._id,
                        fileUploadURL: ADMIN_FILE_UPLOAD
                    }));
                }
            }).catch((err) =>
            {
                res.status(500).send(err.toString());
            });

        });
    }
}