import SiteRouter from "./site_router";

export default class SiteOTPRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.post('/send-otp', (req, res) =>
        {
            siteModules.OTPObject.apiCall('send-otp', req.body).then((result) =>
            {
                res.send(result);
            }).catch((err) =>
            {
                res.send({error : err});
            });
        });
        this.router.post('/check-otp', (req, res) =>
        {
            siteModules.OTPObject.apiCall('check-otp', req.body).then((result) =>
            {
                res.send(result);
            }).catch((err) =>
            {
                res.send({error : err});
            });
        });
    }
}