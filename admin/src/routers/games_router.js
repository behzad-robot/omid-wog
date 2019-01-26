
import { AdminRouter } from "./admin_router";
import { API_URL, ADMIN_FILE_UPLOAD } from "../constants";
export default class GamesPanelRouter extends AdminRouter
{
    constructor(AdminModules)
    {
        super();
        const Admin = AdminModules.Admin;
        this.requireAdmin();
        this.router.get('/', (req, res) =>
        {
            res.send(this.renderTemplate('games-list.html', {
                admin: req.session.admin
            }));
        });
        this.router.get('/:_id', (req, res) =>
        {
            res.send(this.renderTemplate('game-single.html', {
                admin: req.session.admin,
                _id : req.params._id,
                fileUploadURL: ADMIN_FILE_UPLOAD
            }));
        });
    }
}