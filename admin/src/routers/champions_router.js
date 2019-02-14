
import { AdminRouter } from "./admin_router";
import { API_URL, ADMIN_FILE_UPLOAD } from "../constants";
import { S_IFREG } from "constants";
export default class ChampionsPanelRouter extends AdminRouter
{
    constructor(AdminModules)
    {
        super();
        const Admin = AdminModules.Admin;
        this.requireAdmin();
        this.router.get('/', (req, res) =>
        {
            res.send(this.renderTemplate('champs-list.html', {
                admin: req.session.admin
            }));
        });
        this.router.get('/new', (req, res) =>
        {
            AdminModules.Champion.insert({
                name: 'New Champion',
            }).then((result) =>
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
                res.send('<p>Item Delete Result</p>'+JSON.stringify(result)+'<br><br><a href="/admin/champions/">Back to Champs</a>');
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
            req.body.abilities = JSON.parse(req.body.abilities);
            req.body.roles = JSON.parse(req.body.roles);
            req.body.stats = JSON.parse(req.body.stats);
            req.body.talents = JSON.parse(req.body.talents);
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
            res.send(this.renderTemplate('champ-single.html', {
                admin: req.session.admin,
                _id: req.params._id,
                fileUploadURL: ADMIN_FILE_UPLOAD
            }));
        });

    }
}