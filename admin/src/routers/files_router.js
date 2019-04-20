
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
            if (!dir.endsWith('/'))
                dir += '/';
            console.log('dir is ' + dir);
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
        this.router.get('/update-sitemap', (req, res) =>
        {
            var siteMapStr = '';
            adminModules.Post.find({}, 2000).then((posts) =>
            {
                for (var i = 0; i < posts.length; i++)
                {
                    siteMapStr += 'http://worldofgamers.ir/posts/' + posts[i].slug;
                    siteMapStr += '\n';
                }
                adminModules.PostCategory.find({}, 2000).then((cats) =>
                {
                    for (var i = 0; i < cats.length; i++)
                    {
                        siteMapStr += 'http://worldofgamers.ir/posts/categories/' + cats[i].slug + '/';
                        siteMapStr += '\n';
                    }
                    fs.writeFile(path.resolve('../storage/sitemap.txt'), siteMapStr, (err) =>
                    {
                        if (err)
                        {
                            res.status(500).send(err.toString());
                            return;
                        }
                        res.send('sitemap file updated!<br>' + siteMapStr);
                    });
                });
            });
        });
        this.router.get('/update-images-cache', (req, res) =>
        {
            let statusFile = path.resolve('images-cache-status-file.txt');
            let fileContent = fs.readFileSync(statusFile).toString();
            let writeToStatusFile = (content) =>
            {
                fs.writeFileSync(statusFile, content);
            };
            let writeContent = '';
            let _log = (content) =>
            {
                console.log(content);
                writeContent += content + '\n';
            };
            if (fileContent == 'posts' || fileContent == 'media')
            {
                res.send(`Another Convert is in progress please check in later<br>${fileContent}`);
                return;
            }
            if (req.query.type == 'posts')
            {
                writeToStatusFile('posts');
                res.send('Started Updating Posts Cache... Refresh in a few minutes');
                adminModules.Post.find({}, 1000).then((posts) =>
                {
                    var sizes = SchemaResizes.Post;
                    for (var i = 0; i < posts.length; i++)
                    {
                        var post = posts[i];
                        for (var j = 0; j < sizes.length; j++)
                            resizeImageIfNeeded(post.thumbnail, sizes[j], undefined, _log);
                    }
                    writeToStatusFile(writeContent);
                }).catch((err) =>
                {
                    writeToStatusFile(err.toString());
                });
            }
            else if (req.query.type == 'media')
            {
                writeToStatusFile('media');
                res.send('Started Updating Media Cache... Check again in a few minutes');
                adminModules.Media.find({}, 1000).then((media) =>
                {
                    var sizes = SchemaResizes.Media;
                    for (var i = 0; i < media.length; i++)
                    {
                        var m = media[i];
                        for (var j = 0; j < sizes.length; j++)
                            resizeImageIfNeeded(m.thumbnail_url, sizes[j], undefined, _log);
                    }
                    writeToStatusFile(writeContent);
                }).catch((err) =>
                {
                    writeToStatusFile(err.toString());
                });
            }
            else
                res.send(fileContent);
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
        {
            width: 800,
            height: 600,
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
        },
        {
            width: 640,
            height: 480,
        },
        {
            width: 1280,
            height: 720,
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
        _log('Fatal Error: File Doesnt Exist => ' + originalPath);
        if (next != undefined)
            next('Fatal Error: File Doesnt Exist => ' + originalPath);
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
                .cover(r.width, r.height/*, Jimp.VERTICAL_ALIGN_MIDDLE | Jimp.HORIZONTAL_ALIGN_MIDDLE*/)
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