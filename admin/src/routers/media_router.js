
import { AdminRouter } from "./admin_router";
import { API_URL, ADMIN_FILE_UPLOAD } from "../constants";
import { updateCache } from "../utils/cache";
export default class MediaPanelRouter extends AdminRouter
{
    constructor(AdminModules)
    {
        super();
        const Media = AdminModules.Media;
        this.requireAdmin();
        // this.router.use((req,res,next)=>{
        //     // console.log(req.url);
        //     if(req.url.indexOf('edit') != -1 || req.url.indexOf('new') != -1 || req.url.indexOf('delete') != -1)
        //     {
        //         updateCache('all-Medias');
        //     }
        //     next();
        // });
        this.router.get('/', (req, res) =>
        {
            res.send(this.renderTemplate('media-list.html', {
                admin: req.session.admin
            }));
        });
        this.router.get('/new', (req, res) =>
        {
            Media.insert({
                title: 'New Media',
                slug : 'new-media',
                gameId : "?",
                champID : "?",
                body : "",
                url : "?",
                tags : [],
            }).then((result) =>
            {
                if (result._id)
                    res.redirect('/admin/media/' + result._id + '/');
                else
                    res.send(result);
            }).catch((err) =>
            {
                res.send(err);
            });
        });
        this.router.get('/:_id/delete', (req, res) =>
        {
            Media.delete(req.params._id).then((result) =>
            {
                res.send('<p>Item Delete Result</p>'+JSON.stringify(result)+'<br><br><a href="/admin/media/">Back to Medias</a>');
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
            req.body.tags = JSON.parse(req.body.tags);
            const _id = req.body._id;
            delete (req.body._id);
            Media.edit(_id, req.body).then((result) =>
            {
                res.redirect('/admin/media/' + _id + '/?edit=success');
            }).catch((err) =>
            {
                res.send(err);
            });
        });
        this.router.get('/:_id', (req, res) =>
        {
            res.send(this.renderTemplate('media-single.html', {
                admin: req.session.admin,
                _id : req.params._id,
                fileUploadURL: ADMIN_FILE_UPLOAD
            }));
        });
    }
}