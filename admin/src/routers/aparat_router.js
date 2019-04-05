
import { AdminRouter } from "./admin_router";
import { API_URL, ADMIN_FILE_UPLOAD } from "../constants";
import { updateCache } from "../utils/cache";
const fs = require('fs');
const path = require('path');
export default class AparatAdminRouter extends AdminRouter
{
    constructor(AdminModules)
    {
        super();
        this.requireAdmin();
        this.router.get('/', (req, res) =>
        {
            //check files exisiting:
            var aparatFolderPath = path.resolve('../storage/aparat/');
            if (!fs.existsSync(aparatFolderPath))
            {
                fs.mkdirSync(aparatFolderPath);
                console.log('created folder ' + aparatFolderPath);
            }
            var aparatVideosJsonFile = path.resolve('../storage/aparat/posts-archive-aparat.json');
            if (!fs.existsSync(aparatVideosJsonFile))
            {
                fs.writeFileSync(aparatVideosJsonFile, JSON.stringify([]));
                console.log('created file ' + aparatVideosJsonFile);
            }
            //load files:
            var aparatVideos = JSON.parse(fs.readFileSync(aparatVideosJsonFile).toString());
            res.send(this.renderTemplate('aparat.html', {
                admin: req.session.admin,
                fileUploadURL: ADMIN_FILE_UPLOAD,
                aparatVideos: aparatVideos,
                aparatVideosStr: JSON.stringify(aparatVideos),
            }));
        });
        this.router.post('/save', (req, res) =>
        {
            var aparatVideosJsonFile = path.resolve('../storage/aparat/posts-archive-aparat.json');
            fs.writeFile(aparatVideosJsonFile, req.body.aparatVideosStr, (err) =>
            {
                if (err)
                {
                    res.send(err);
                    return;
                }
                res.redirect('/admin/aparat');
            });
        });
    }
}