import SiteRouter from "./site_router";
import { isEmptyString } from "../utils/utils";

export default class SiteCommentsRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.post('/new', (req, res) =>
        {
            if (!this.isLoggedIn(req))
            {
                res.send({ error: "Access Denied! You gotta login." });
                return;
            }
            if (isEmptyString(req.body.objectType) || isEmptyString(req.body.objectId))
            {
                res.send({ error: "Parameters Missing" });
                return;
            }
            const data = {
                userId: req.session.currentUser._id,
                objectType: req.body.objectType,
                objectId: req.body.objectId,
                body: req.body.body,
                _draft: false, // the post-single page can react differently based on this.
            }
            siteModules.Comment.insert(data).then((comment) =>
            {
                res.send({ comment: comment });
            }).catch((err) =>
            {
                console.log("new comment error=" + err.toString());
                res.send({ error: err.toString() });
            });
        });
    }
}