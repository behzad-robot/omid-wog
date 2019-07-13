
import { log } from './libs/log';
import { GetMongoDBURL, IS_LOCALHOST } from './constants';
import { EasySocket } from './libs/easy-socket';
import MyExpressApp from './libs/express';
import { ChatSocketRouter } from './routers/chat_router';
import { APISocket } from "./utils/api-socket";
import { User } from './utilsApi/user';
import { SocialChatGroup } from './utilsApi/social_chat_group';
import { SocialChatArchive } from './utilsApi/social_chat_archive';
const morgan = require('morgan');

const express = new MyExpressApp({
    hasSessionEngine: false,
    mongoUrl: GetMongoDBURL(),
    serveFiles: '../storage'
});
express.expressApp.all('*', (req, res, next) =>
{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
console.log('running localhost?=>' + IS_LOCALHOST());
//log middleware:
express.expressApp.use(morgan('tiny'))
//add routers here:
express.expressApp.get('*', (req, res) =>
{
    res.status(200).send('Welcome to Chat Server');
});
const apiSocket = new APISocket();
//modules:
const chatModules = {
    User: new User(apiSocket),
    ChatGroup: new SocialChatGroup(apiSocket),
    ChatArchive: new SocialChatArchive(apiSocket),
};
//listen:
const PORT = 7575;
express.http.listen(PORT, function ()
{
    log.success('chat server listening on port ' + PORT);
    apiSocket.connect(() =>
    {
        log.success("api socket connected.");
    });
});
const WSRouters = [
    new ChatSocketRouter(chatModules),
];
const easySocket = new EasySocket({
    httpServer: express.http,
    originIsAllowed: (origin) => { return true; },
    onMessage: (socket, messageStr) =>
    {
        socket._send = socket.send;
        socket.send = (ms) =>
        {
            if (typeof ms != 'string')
                ms = JSON.stringify(ms);
            socket.sendUTF(ms);
        };
        if (messageStr.indexOf('{') != -1)
        {
            // console.log(messageStr);
            var msg = JSON.parse(messageStr);
            console.log(`Socket=>${msg.method}`);
            for (var i = 0; i < WSRouters.length; i++)
                WSRouters[i].onMessage(socket, msg);
        }
        else
            socket.send({ code: 400, error: "Access Denied" });
    },
    onSocketConnected: (connection) =>
    {
        console.log("onSocketConnected");
    },
    onSocketDisconnected: (connection, reasonCode, description) =>
    {
        console.log("onSocketDisconnected");
        WSRouters[0].removeUser();
    },
});
