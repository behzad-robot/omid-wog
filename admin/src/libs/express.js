const express = require('express');
const session = require('express-session');
export default class MyExpressApp
{
    constructor(settings = {
        hasSessionEngine: true,
        mongoUrl: 'mongodb://localhost:27017/dummy-sessions',
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
            this.expressApp.use(express.static(settings.serveFiles));
        //helper for file uploads:
        const fileUpload = require('express-fileupload');
        this.expressApp.use(fileUpload());
    }
}