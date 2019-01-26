import Router from "../libs/router";
import { JesEncoder } from "../utils/jes-encoder";
import { API_ENCODE_KEY, ADMIN_TOKEN, API_TOKEN } from "../constants";
const encoder = new JesEncoder(API_ENCODE_KEY);
export default class APIRouter extends Router
{
    constructor()
    {
        super();
        //bind functions:
        this.sendResponse = this.sendResponse.bind(this);
        this.handleError = this.handleError.bind(this);
        this.apiTokenRequired = this.apiTokenRequired.bind(this);
        this.adminTokenRequired = this.adminTokenRequired.bind(this);
        this.encoder = encoder;
    }
    //override send Reponse:
    sendResponse(req, res, body, code = 200)
    {
        var encoded = req.header('api-token') == API_TOKEN;
        //console.log("hello this is override!");
        if (req.header('admin-token') == ADMIN_TOKEN)
            res.status(code).send(body);
        else
            res.status(code).send({ code: code, error: null, _data: encoded ? encoder.encode(body) : body });
    }
    handleError(req, res, err, code = 500)
    {
        err = err.toString();
        res.status(code).send({ code: code, error: (err != null && err != "" ? err : "Null"), _data: null });
        //this.sendResponse(req, res, { error: (err != null && err != "" ? err : "Null"), code: code }, code);
    }
    apiTokenRequired()
    {
        this.router.use((req, res, next) =>
        {
            //console.log(":| hey middleware!" + JSON.stringify(req.headers));
            if (req.header('api-token') != API_TOKEN)
            {
                this.handleError(req, res, "Access Denied", 400);
                return;
            }
            next();
        });
    }
    adminTokenRequired()
    {
        this.router.use((req, res, next) =>
        {
            //console.log(":| hey middleware!" + JSON.stringify(req.headers));
            if (req.header('admin-token') != ADMIN_TOKEN)
            {
                this.handleError(req, res, "Access Denied", 400);
                return;
            }
            next();
        });
    }
}