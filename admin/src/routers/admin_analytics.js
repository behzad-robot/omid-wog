
import { AdminRouter } from "./admin_router";

export default class AdminAnalyticsRouter extends AdminRouter
{
    constructor(AnalyticsEvent)
    {
        super();
        this.router.get('/analytics/', (req, res) =>
        {
            res.status(200).send(this.renderTemplate('analytics.html', {}));
        });
        this.router.all('/api/analytics/', (req, res) =>
        {
            AnalyticsEvent.apiCall('', req.method, req.method == 'POST' ? req.body : {}).then((text) =>
            {
                res.status(200).send(text);
            }).catch((err) =>
            {
                res.status(500).send("Failed:"+err.toString());
            });
        });
    }
}