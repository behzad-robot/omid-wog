
import { AdminRouter } from "./admin_router";
import { API_URL, ADMIN_FILE_UPLOAD } from "../constants";
import { S_IFREG } from "constants";
import { updateCache } from "../utils/cache";
import { isEmptyString } from "../utils/utils";
export default class ChampionsPanelRouter extends AdminRouter
{
    constructor(AdminModules)
    {
        super();
        const Admin = AdminModules.Admin;
        const AdminLog = AdminModules.AdminLog;
        this.requireAdmin();
        this.router.use((req, res, next) =>
        {
            // console.log(req.url);
            if (req.url.indexOf('edit') != -1 || req.url.indexOf('new') != -1 || req.url.indexOf('delete') != -1)
            {
                console.log('update cache for allDota2Champions');
            }
            if (!this.hasPermission(req, 'games') && !this.hasPermission(req, 'games-super'))
            {
                this.accessDenied(req, res, 'you cant access games part');
                return;
            }
            if ((req.url.indexOf('edit') != -1 || req.url.indexOf('delete') != -1) && req.query.edit == undefined)
            {
                let action = 'champs-?';
                if (req.url.indexOf('edit') != -1)
                    action = 'champs-edit';
                else if (req.url.indexOf('delete') != -1)
                    action = 'champs-delete';
                AdminLog.insert({
                    userId: req.session.admin._id,
                    title: action,
                    url: req.baseUrl + req.url,
                    postBody: req.method == 'POST' ? req.body : {},
                }).then((result) =>
                {
                    console.log(result);
                    console.log('=======');
                }).catch((err) =>
                {
                    console.log(err);
                });
            }
            next();
        });
        this.router.get('/', (req, res) =>
        {
            res.send(this.renderTemplate('champs-list.html', {
                admin: req.session.admin
            }));
        });
        this.router.get('/new', (req, res) =>
        {
            var data = {
                name: 'New Champion',

            };
            if (req.query.game == 'moba')
                data.roles = [];
            else if (req.query.game == 'mortal')
            {
                data.gameId = '5c6411967394a078f182e662';
                data.moves = [];
                data.varirations = [];
            }
            AdminModules.Champion.insert(data).then((result) =>
            {
                if (result._id)
                    res.redirect('/admin/champions/' + result._id + '/');
                else
                    res.send(result);
            }).catch((err) =>
            {
                res.send(err);
            });
        });
        this.router.get('/:_id/delete', (req, res) =>
        {
            AdminModules.Champion.delete(req.params._id).then((result) =>
            {
                res.send('<p>Item Delete Result</p>' + JSON.stringify(result) + '<br><br><a href="/admin/champions/">Back to Champs</a>');
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
            console.log(req.body);
            req.body._draft = req.body._draft == 'on' ? true : false;
            // req.body.media = JSON.parse(req.body.media);
            if (req.body.abilities)
            {
                req.body.abilities = JSON.parse(req.body.abilities);
                req.body.roles = JSON.parse(req.body.roles);
                req.body.stats = JSON.parse(req.body.stats);
                req.body.talents = JSON.parse(req.body.talents);
                req.body.featuredBuilds = JSON.parse(req.body.featuredBuilds);
                req.body.featuredItems = JSON.parse(req.body.featuredItems);
            }
            if (req.body.moves)
            {
                req.body.variations = JSON.parse(req.body.variations);
                req.body.moves = JSON.parse(req.body.moves);
            }
            const _id = req.body._id;
            delete (req.body._id);
            AdminModules.Champion.edit(_id, req.body).then((result) =>
            {
                res.redirect('/admin/champions/' + _id + '/?edit=success');
            }).catch((err) =>
            {
                res.send(err);
            });
        });
        this.router.get('/:_id', (req, res) =>
        {
            AdminModules.Champion.getOne(req.params._id).then((champ) =>
            {
                if (isEmptyString(champ.gameId))
                {
                    res.send(this.renderTemplate('champ-moba-single.html', {
                        admin: req.session.admin,
                        _id: req.params._id,
                        fileUploadURL: ADMIN_FILE_UPLOAD
                    }));
                }
                else
                {
                    AdminModules.Game.getOne(champ.gameId).then((game) =>
                    {
                        if (game != undefined && game.token.toString().indexOf('mortal') == -1)
                        {
                            console.log('we are inside if!');
                            res.send(this.renderTemplate('champ-moba-single.html', {
                                admin: req.session.admin,
                                _id: req.params._id,
                                fileUploadURL: ADMIN_FILE_UPLOAD
                            }));
                        }
                        else
                        {
                            res.send(this.renderTemplate('champ-mortal-single.html', {
                                admin: req.session.admin,
                                _id: req.params._id,
                                fileUploadURL: ADMIN_FILE_UPLOAD
                            }));
                        }
                    }).catch((err) =>
                    {
                        res.status(500).send(`Internal Server error<br>${err.toString()}`);
                    });
                }

            });

        });

    }
}