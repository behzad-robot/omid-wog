
import { AdminRouter } from "./admin_router";
import { API_URL, ADMIN_FILE_UPLOAD } from "../constants";
export default class CommentsPanelRouter extends AdminRouter
{
    constructor(AdminModules)
    {
        super();
        const Comment = AdminModules.Comment;
        this.requireAdmin();
        this.router.get('/', (req, res) =>
        {
            res.send(this.renderTemplate('comments-list.html', {
                admin: req.session.admin
            }));
        });
        this.router.get('/:_id/delete', (req, res) =>
        {
            Comment.delete(req.params._id).then((result) =>
            {
                res.send('<p>Comment Delete Result</p>' + JSON.stringify(result) + '<br><br><a href="/admin/comments/">Back to Comments</a>');
            }).catch((err) =>
            {
                res.send(err);
            });
        });
        this.router.get('/:_id/toggle-draft/', (req, res) =>
        {
            Comment.edit(req.params._id,{_draft : req.query._draft}).then((result) =>
            {
                res.send({success : true , comment : result });
            }).catch((err) =>
            {
                res.send({success : false , error : err.toString() });
            });
        });
        this.router.post('/:_id/edit', (req, res) =>
        {
            if (req.body._id == undefined)
            {
                res.send({ error: "Missing _id", code: 500 });
                return;
            }
            const _id = req.body._id;
            delete (req.body._id);
            Comment.edit(_id, req.body).then((result) =>
            {
                res.redirect('/admin/comments/' + _id + '/?edit=success');
            }).catch((err) =>
            {
                res.send(err);
            });
        });
        this.router.get('/:_id', (req, res) =>
        {
            res.send(this.renderTemplate('comment-single.html', {
                admin: req.session.admin,
                _id: req.params._id,
                fileUploadURL: ADMIN_FILE_UPLOAD
            }));
        });
    }
}