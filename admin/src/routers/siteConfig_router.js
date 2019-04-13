
import { AdminRouter } from "./admin_router";
import { API_URL, ADMIN_FILE_UPLOAD } from "../constants";
import { updateCache } from "../utils/cache";
const fs = require('fs');
const path = require('path');
const CONFIG_FILE_PATH = path.resolve('../site-new/config.json');
export default class SiteConfigAdminRouter extends AdminRouter
{
    constructor(AdminModules)
    {
        super();
        this.requireAdmin();
        this.router.get('/', (req, res) =>
        {
            var siteConfigStr = (fs.readFileSync(CONFIG_FILE_PATH).toString());
            res.send(this.renderTemplate('site-config.html', {
                admin: req.session.admin,
                fileUploadURL: ADMIN_FILE_UPLOAD,
                siteConfigStr: siteConfigStr,
            }));
        });
        this.router.post('/save', (req, res) =>
        {
            fs.writeFile(CONFIG_FILE_PATH, req.body.siteConfigStr, (err) =>
            {
                if (err)
                {
                    res.send(err);
                    return;
                }
                res.redirect('/admin/site-config');
            });
        });
    }
}