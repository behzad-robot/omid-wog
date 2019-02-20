import APIRouter from "./api_router";
import { SocketRouter } from "./socket_router";
import { IS_LOCALHOST } from "../constants";
const fs = require('fs');
const path = require('path');

const handler = new AppInfoHandler();
export class AppInfoHttpRouter extends APIRouter
{
    constructor()
    {
        super();
        this.router.get('/app-info', (req, res) =>
        {
            handler.loadAppInfo().then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
    }
}
export class AppInfoSocketRouter extends SocketRouter
{
    constructor()
    {
        super();
        this.onMessage = this.onMessage.bind(this);
    }
    onMessage(socket, request)
    {
        if (!this.isValidRequest(request))
            return;
        if (request.model != 'app-info' || request.model != 'get')
            return;
        handler.loadAppInfo().then((result) =>
        {
            this.sendResponse(socket, request, result);
        }).catch((err) =>
        {
            this.handleError(socket, request, err);
        });
    }
}
class AppInfoHandler
{
    constructor()
    {
        this.loadAppInfo = this.loadAppInfo.bind(this);
    }
    loadAppInfo()
    {
        return new Promise((resolve, reject) =>
        {
            const appInfo = new AppInfo();
            appInfo.load((err, data) =>
            {
                if (err)
                {
                    // this.handleError(req, res, err.toString(), 500);
                    reject(err.toString());
                    return;
                }
                // this.sendResponse(req, res, data);
                resolve(data);
            });
        });
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