
import { AdminRouter } from "./admin_router";
import { API_URL, ADMIN_FILE_UPLOAD } from "../constants";
export default class PostsPanelRouter extends AdminRouter
{
    constructor(AdminModules)
    {
        super();
        const Admin = AdminModules.Admin;
        this.requireAdmin();
        this.router.get('/', (req, res) =>
        {
            res.send(this.renderTemplate('posts-list.html', {
                admin: req.session.admin
            }));
        });
        this.router.get('/:_id', (req, res) =>
        {
            res.send(this.renderTemplate('post-single.html', {
                admin: req.session.admin,
                _id : req.params._id,
                fileUploadURL: ADMIN_FILE_UPLOAD
            }));
        });
    }
}