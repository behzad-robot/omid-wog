import { GetMongoDBURL, IS_LOCALHOST } from '../constants';

const express = require('express');
const session = require('express-session');
export default class MyExpressApp
{
    constructor(settings = {
        hasSessionEngine: true,
        mongoUrl: GetMongoDBURL(),
        serveFiles: 'public',
    })
    {
        this.expressApp = express();
        this.http = require('http').Server(this.expressApp);
        //sessions:
        if (settings.hasSessionEngine)
        {
            const MongoStore = require('connect-mongo')(session);
            var sess = {
                secret: '0235notjustatroll65895',
                resave: false,
                saveUninitialized: true,
                cookie: { secure: false },
                store: new MongoStore({ url: settings.mongoUrl })
            };
            if (this.expressApp.get('env') === 'production')
            {
                this.expressApp.set('trust proxy', 1) // trust first proxy
                sess.cookie.secure = true // serve secure cookies
            }
            this.expressApp.use(session(sess));
        }
        //body parse:
        const bodyParser = require('body-parser');
        this.expressApp.use(bodyParser.json());       // to support JSON-encoded bodies
        this.expressApp.use(bodyParser.urlencoded({     // to support URL-encoded bodies
            extended: true
        }));
        //serve static files:
        if (settings.serveFiles != undefined)
        {
            if(typeof settings.serveFiles == 'string')
                this.expressApp.use(express.static(settings.serveFiles));
            else
            {
                
                    for(var i = 0 ; i < settings.serveFiles.length;i++)
                    {
                        if(typeof settings.serveFiles[i] == 'string')
                            this.expressApp.use(express.static(settings.serveFiles[i]));
                        else
                            this.expressApp.use(settings.serveFiles[i].prefix,express.static(settings.serveFiles[i].path));
                    }
            }
        }
        //helper for file uploads:
        const fileUpload = require('express-fileupload');
        this.expressApp.use(fileUpload());
    }
}