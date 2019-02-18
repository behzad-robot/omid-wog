import BehzadTimer from "./libs/behzad_timer";
import { API_TOKEN, ADMIN_TOKEN } from "./constants";
import fetch from 'node-fetch';
const request = require('request');
var WebSocketClient = require('websocket').client;

var t = new BehzadTimer();
// shine();
// die();
socket();
function socket()
{
    console.log('studid shit');
    var s = new WebSocketClient();
    s.on('connect', (connection) =>
    {
        console.log('connected');
        connection.on('error', function (error)
        {
            console.log("Connection Error: " + error.toString());
        });
        connection.on('close', function ()
        {
            console.log('echo-protocol Connection Closed');
        });
        connection.on('message', function (message)
        {
            if (message.type === 'utf8')
            {
                // console.log("Received: '" + message.utf8Data + "'");
                var str = message.utf8Data;
                console.log(str);
                if (str == 'handshake-answer')
                {
                    connection.send(JSON.stringify({ model: 'users', method: 'find', params: {}, _headers: { 'api-token': API_TOKEN, 'admin-token': ADMIN_TOKEN } }));
                }
                else
                {
                    t.tick('Response!');
                }
            }
        });
        connection.send('handshake');
    });
    s.on('connectFailed', (err) =>
    {
        console.log('connectFailed=>' + err);
    });
    s.connect('ws://localhost:8585/');
}
function sendData(socket, data)
{
    socket.send(data);
}