import { API_TOKEN, ADMIN_TOKEN } from '../constants';

const WebSocketClient = require('websocket').client;
let requestId = 0;
export class APISocket
{
    constructor(settings = {
        url: "ws://localhost:8585/"

    })
    {
        this.settings = settings;
        this.ws = new WebSocketClient();
        this.socket = undefined;
        this.onConnected = undefined;
        this.requests = [];
        this.apiCall = this.apiCall.bind(this);
        this.connect = this.connect.bind(this);

        this.ws.on('connect', (conn) =>
        {
            this.socket = conn;
            // console.log('API Socket connected');
            conn._send = conn.send;
            conn.send = function (ms)
            {
                if (typeof ms != 'string')
                    ms = JSON.stringify(ms);
                conn.sendUTF(ms);
            }
            conn.sendUTF('handshake');
            conn.on('error', function (err)
            {
                console.log("API Socket Connection Error: " + err.toString());
            });
            conn.on('close', function ()
            {
                console.log('API Socket Connection Closed.');
            });
            conn.on('message', (message) =>
            {
                if (message.type == 'utf8')
                {
                    var str = message.utf8Data;
                    if (str == 'handshake-answer')
                    {
                        // console.log(str);
                        if (this.onConnected != undefined)
                            this.onConnected();
                        //start ping:
                        setInterval(() =>
                        {
                            conn.sendUTF('ping');
                        }, 300);
                    }
                    else if (str.indexOf('{') != - 1)
                    {
                        // console.log(str);
                        var response = JSON.parse(str);
                        // console.log("active requests=>" + this.requests.length);
                        //search between requests:
                        for (var i = 0; i < this.requests.length; i++)
                        {
                            var r = this.requests[i];
                            if (r.requestId == response.request.requestId)
                            {
                                // console.log("found related request!");
                                if (r.callBack != undefined)
                                    r.callBack(response);
                            }
                        }
                    }
                    else
                    {
                        //ignore shit :D
                    }
                }
            });
        });
        this.ws.on('connectFailed', (err) =>
        {
            console.log("API Socket connecting failed => error=" + err.toString());
        });
    }
    connect(onConnected = undefined)
    {
        this.ws.connect(this.settings.url);
        this.onConnected = onConnected;
    }
    apiCall(modelSlug, method, params, callBack) //(err,response)
    {
        var r = {
            requestId: requestId++,
            model: modelSlug,
            method: method,
            params: params,
            _headers: {
                'api-token': API_TOKEN,
                'admin-token': ADMIN_TOKEN,
            }
        }
        console.log('inside apiCall!');
        var b = Object.assign({}, r);
        b.callBack = callBack;
        this.requests.push(b);
        this.socket.send(r);
    }
}