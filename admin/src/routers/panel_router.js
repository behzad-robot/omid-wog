
import { AdminRouter } from "./admin_router";
import { IS_LOCALHOST, API_URL, ADMIN_URL, API_BASE_URL, ADMIN_TOKEN, API_FILE_UPLOAD } from "../constants";
import { API_TOKEN } from "../../../api/src/constants";
const multiparty = require("multiparty");

export default class AdminPanelRouter extends AdminRouter
{
    constructor(AdminModel)
    {
        super();
        const Admin = AdminModel;
        this.requireAdmin();
        this.router.get('/', (req, res) =>
        {
            res.send(this.renderTemplate('panel.html', {
                admin: req.session.admin
            }));
        });
        this.router.get('/file-upload', (req, res) =>
        {
            res.send(this.renderTemplate('file-uploader.html', {
                admin: req.session.admin,
                fileUploadURL: API_FILE_UPLOAD
            }));
        });
        
        // this.router.post('/try-file-upload', (httpReq, httpRes) =>
        // {
        //     var form = new multiparty.Form();
        //     form.on("part", function (part)
        //     {
        //         if (part.filename)
        //         {
        //             var FormData = require("form-data");
        //             var request = require("request")
        //             var form = new FormData();
        //             form.append("my-file", part, { 'my-file': part['my-file'], contentType: part["content-type"] });
        //             var r = request.post("http://localhost:8585/api/file-upload", { "headers": { "api-token":API_TOKEN } }, function (err, res, body)
        //             {
        //                 httpRes.send(res);
        //             });
        //             r._form = form
        //         }
        //     })

        //     form.on("error", function (error)
        //     {
        //         console.log(error);
        //         httpRes.send(error);
        //     })
        //     form.parse(httpReq);
        // });
    }
}