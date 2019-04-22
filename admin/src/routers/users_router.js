
import { AdminRouter } from "./admin_router";
import { API_URL, ADMIN_FILE_UPLOAD } from "../constants";
import { updateCache } from "../utils/cache";
const fs = require('fs');
const path = require('path');
export default class UsersPanelRouter extends AdminRouter
{
    constructor(AdminModules)
    {
        super();
        this.requireAdmin();
        this.router.get('/edit-admin', (req, res) =>
        {
            var userFolderPath = path.resolve('../storage/users/' + req.session.admin._id);
            if (!fs.existsSync(userFolderPath))
            {
                fs.mkdirSync(userFolderPath);
                console.log('created folder ' + userFolderPath);
            }
            res.send(this.renderTemplate('edit-admin.html', {
                admin: req.session.admin,
                fileUploadURL: ADMIN_FILE_UPLOAD,
            }));
        });
        this.router.post('/edit-admin-submit', (req, res) =>
        {
            var userFolderPath = path.resolve('../storage/users/' + req.session.admin._id);
            if (!fs.existsSync(userFolderPath))
            {
                fs.mkdirSync(userFolderPath);
                console.log('created folder ' + userFolderPath);
            }
            delete (req.body._id);
            delete (req.body.createdAt);
            delete (req.body.updatedAt);
            delete (req.body.lastLogin);
            console.log(`isPersonel=>`+req.body.isPersonel);
            req.body.isPersonel = req.body.isPersonel == 'on' ? true : false;
            console.log(`personelCategory=>`+req.body.personelCategory);
            AdminModules.User.edit(req.session.admin._id, req.body).then((result) =>
            {
                req.session.admin = result;
                req.session.save(() =>
                {
                    res.redirect('/admin/users/edit-admin');
                });
            }).catch((err) =>
            {
                res.status(500).send(err.toString());
            });
        });
    }
}