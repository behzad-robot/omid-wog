
import { AdminRouter } from "./admin_router";
import { API_URL, ADMIN_FILE_UPLOAD } from "../constants";
import { S_IFREG } from "constants";
import { updateCache } from "../utils/cache";
export default class ChampionsPanelRouter extends AdminRouter
{
    constructor(AdminModules)
    {
        super();
        const Admin = AdminModules.Admin;
        this.requireAdmin();
        this.router.use((req, res, next) =>
        {
            // console.log(req.url);
            if (req.url.indexOf('edit') != -1 || req.url.indexOf('new') != -1 || req.url.indexOf('delete') != -1)
            {
                console.log('update cache for allDota2Champions');
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
            var data =  {
                name : 'New Champion',

            };
            if(req.query.game == 'moba')
                data.roles = [];
            else if(req.query.game == 'mortal')
            {
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
            if(req.body.abilities)
            {
                req.body.abilities = JSON.parse(req.body.abilities);
                req.body.roles = JSON.parse(req.body.roles);
                req.body.stats = JSON.parse(req.body.stats);
                req.body.talents = JSON.parse(req.body.talents);
            }
            if(req.body.moves)
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
                if (champ.moves == undefined)
                {
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
            });

        });

    }
}