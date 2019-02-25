
import { AdminRouter } from "./admin_router";
import { API_URL, ADMIN_FILE_UPLOAD } from "../constants";
import { getResizedFileName } from "../utils/utils";
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
export default class AdminFilesRouter extends AdminRouter
{
    /*
        A new / better interface for uploading files via admin panel :D
    */
    constructor(adminModules)
    {
        super();
        this.requireAdmin();
        this.router.post('/upload', (req, res) =>
        {
            var dir = req.body.dir ? req.body.dir : '';
            if(!dir.endsWith('/'))
                dir += '/';
            console.log('dir is '+dir);
            this.handleFile(req, res, 'my-file', dir).then((result) =>
            {
                if (result)
                {
                    result.link = result.path;
                    res.send(result);
                }
                else
                    res.send({ success: false, error: "nothing to upload" });
            }).catch((err) =>
            {
                res.send({ success: false, error: err.toString() });
            });
        });
        this.router.get('/update-images-cache', (req, res) =>
        {
            var response = '';
            let filesCreated = 1;
            var _log = (msg) =>
            {
                console.log(msg);
                response += msg + '\n';
            };
            adminModules.Post.find({}, 1000).then((posts) =>
            {
                _log('*************************');
                _log(`loaded ${posts.length} posts!`);
                var sizes = SchemaResizes.Post;
                filesCreated += posts.length * sizes.length;
                for (var i = 0; i < posts.length; i++)
                {
                    var post = posts[i];
                    for (var j = 0; j < sizes.length; j++)
                        resizeImageIfNeeded(post.thumbnail, sizes[j], undefined, _log);
                }
                adminModules.Media.find({}, 1000).then((media) =>
                {
                    _log('*************************');
                    _log(`loaded ${media.length} media!`);
                    var sizes = SchemaResizes.Media;
                    filesCreated += media.length * sizes.length;
                    for (var i = 0; i < media.length; i++)
                    {
                        var m = media[i];
                        for (var j = 0; j < sizes.length; j++)
                            resizeImageIfNeeded(m.thumbnail_url, sizes[j], undefined, _log);
                    }
                    setTimeout(() =>
                    {
                        res.send(response + 'DONE :)');
                    }, 250 * filesCreated);
                });
            });
        });
    }
}
export const SchemaResizes = {
    Post: [
        {
            width: 150,
            height: 150,
        },
        {
            width: 640,
            height: 480,
        },
    ],
    Media: [
        {
            width: 150,
            height: 150,
        },
        {
            width: 350,
            height: 350,
        }
    ]
};
export const resizeImageIfNeeded = (originalPath, resize, next, _log = console.log) =>
{
    _log('=================resizeImageIfNeeded=============');
    _log(originalPath);
    if (!originalPath.startsWith('/'))
        originalPath = '/' + originalPath;
    var resizePath = getResizedFileName(originalPath, resize.width, resize.height);
    originalPath = path.resolve(".." + originalPath);
    resizePath = path.resolve(".." + resizePath);
    if (!fs.existsSync(originalPath))
    {
        _log('Fatal Error: File Doesnt Exsist => ' + originalPath);
        if (next != undefined)
            next('Fatal Error: File Doesnt Exsist => ' + originalPath);
        return;
    }
    _log(originalPath + ' => OK');
    const rPath = resizePath;
    const oPath = originalPath;
    const r = resize;
    if (!fs.existsSync(resizePath))
    {
        Jimp.read(oPath, (err, img) =>
        {
            if (err)
            {
                console.log(err);
                return;
            }
            img
                .cover(r.width, r.height, Jimp.VERTICAL_ALIGN_MIDDLE)
                .quality(r.quality ? r.quality : 60)
                .write(rPath);
            _log(`file created => ${rPath}`);
            if (next != undefined)
                next(undefined);
        });
    }
    else
    {
        _log(rPath + ' => OK');
        if (next != undefined)
            next(undefined);
    }
}