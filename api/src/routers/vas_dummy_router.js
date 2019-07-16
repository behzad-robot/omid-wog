
import { ADMIN_TOKEN, API_TOKEN, API_ENCODE_KEY } from "../constants";
import APIRouter from "./api_router";

const ObjectId = require('mongoose').Types.ObjectId;

/*
    If your model has default properties defined in models/model-example.js it works with this API generator :)
    A public api shows public fields of objects in find , getOne by default
    If provdided an (header admin-token = ADMIN_TOKEN ) it will show all fields!
*/
export class VasDummyRouter extends APIRouter
{
    constructor(settings = {
        apiTokenRequired: false,
    })
    {
        super(settings);
        this.router.get('/sms-gateway', (req, res) =>
        {
            let response = {
                parameters: {
                    MSSISDN: req.query.MSSISDN,
                    ShortCode: req.query.ShortCode,
                    Content: req.query.Content,
                },
                headers: req.headers,
            };
            res.status(200).send({ success: true, response: response });
        });
        this.router.post('/imi-notifications', (req, res) =>
        {
            res.send(`<response><status>200</status><description>Any Text</description></response>`);
        });

    }
}