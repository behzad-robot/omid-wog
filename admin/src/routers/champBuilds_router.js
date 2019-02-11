
import { AdminRouter } from "./admin_router";
import { API_URL, ADMIN_FILE_UPLOAD } from "../constants";
import { S_IFREG } from "constants";
export default class ChampionBuildsPanelRouter extends AdminRouter {
    constructor(AdminModules) {
        super();
        const Admin = AdminModules.Admin;
        this.requireAdmin();
        this.router.get('/', (req, res) => {
            res.send(this.renderTemplate('builds-list.html', {
                admin: req.session.admin
            }));
        });
        this.router.post('/new', (req, res) => {
            AdminModules.Build.insert({
                title: 'New Build',
                gameId : req.body.gameId,
                champId : req.body.champId,
                userId : req.body.userId ? req.body.userId : '?',
            }).then((result) => {
                if (result._id)
                    res.redirect('/admin/builds/' + result._id + '/');
                else
                    res.send(result);
            }).catch((err) => {
                res.send(err);
            });
        });
        this.router.get('/:_id/delete', (req, res) => {
            AdminModules.Build.delete(req.params._id).then((result) => {
                res.send('<p>Item Delete Result</p>' + JSON.stringify(result) + '<br><br><a href="/admin/builds/">Back to Builds</a>');
            }).catch((err) => {
                res.send(err);
            });
        });
        this.router.post('/:_id/edit', (req, res) => {
            if (req.body._id == undefined) {
                res.send({ error: "Missing _id", code: 500 });
                return;
            }
            req.body.itemRows = JSON.parse(req.body.itemRows);
            req.body.talents = JSON.parse(req.body.talents);
            req.body.abilities = req.body.abilities.split(',');
            const _id = req.body._id;
            delete (req.body._id);
            AdminModules.Build.edit(_id, req.body).then((result) => {
                res.redirect('/admin/builds/' + _id + '/?edit=success');
            }).catch((err) => {
                res.send(err);
            });
        });
        this.router.get('/:_id', (req, res) => {
            res.send(this.renderTemplate('build-single.html', {
                admin: req.session.admin,
                _id: req.params._id,
                fileUploadURL: ADMIN_FILE_UPLOAD
            }));
        });

    }
}