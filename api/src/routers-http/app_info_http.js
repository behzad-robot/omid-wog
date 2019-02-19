import APIRouter from "./api_router";
import { IS_LOCALHOST } from "../constants";
const fs = require('fs');
const path = require('path');
export class AppInfoRouter extends APIRouter
{
    constructor()
    {
        super();
        this.loadAppInfo = this.loadAppInfo.bind(this);
        this.router.get('/app-info', (req, res) =>
        {
            const appInfo = new AppInfo();
            appInfo.load((err, data) =>
            {
                if (err)
                {
                    this.handleError(req, res, err.toString(), 500);
                    return;
                }
                this.sendResponse(req, res, data);
            });
        });
    }
    loadAppInfo(request,resultCallBack)
    {
        
    }

}
export class AppInfo
{
    constructor()
    {
        this.data = {};
        //bind functions:
        this.load = this.load.bind(this);
    }
    load(callBack)
    {
        fs.readFile(path.resolve('public/app-info.json'), (err, d) =>
        {
            if (err)
            {
                callBack(err, null);
                return;
            }

            this.data = d;
            var appInfo = JSON.parse(d.toString());
            if (!IS_LOCALHOST())
            {
                appInfo.splashImage = appInfo.splashImage.toString().replace("localhost", "determination.ir");
                for (var i = 0; i < appInfo.profileImages.length; i++)
                    appInfo.profileImages[i] = appInfo.profileImages[i].toString().replace("localhost", "determination.ir");
            }
            callBack(err, appInfo);
        });
    }
}