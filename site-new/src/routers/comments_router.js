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
            siteModules.Comment.apiCall('new-comment',data).then((comment) =>
            {
                res.send({ comment: comment });
            }).catch((err) =>
            {
                console.log("new comment error=" + err.toString());
                res.send({ error: err.toString() });
            });
        });
        this.router.post('/like', (req, res) =>
        {
            siteModules.Comment.apiCall('set-like', {
                _id: req.body._id,
                like: req.body.like,
                userId: req.body.userId,
                userToken: req.body.userToken,
            }).then((comment) =>
            {
                res.send({ code: 200, comment: comment });
            }).catch((err) =>
            {
                console.log("like comment error=" + err.toString());
                res.send({ code: 500, error: err.toString() });
            });
        });
        this.router.post('/delete', (req, res) =>
        {
            siteModules.Comment.apiCall('delete-comment', {
                _id: req.body._id,
                userId: req.body.userId,
                userToken: req.body.userToken,
            }).then((result) =>
            {
                res.send({ code: 200, _data: result });
            }).catch((err) =>
            {
                console.log("delete comment error=" + err.toString());
                res.send({ code: 500, error: err.toString() });
            });
        });
    }
}