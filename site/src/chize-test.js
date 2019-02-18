import BehzadTimer from "./libs/behzad_timer";
import { APISocket } from "./utils/api-socket";
const request = require('request');
var WebSocketClient = require('websocket').client;

var t = new BehzadTimer();
// shine();
// die();

var apiSocket = new APISocket();
t.tick("init!");
apiSocket.connect(() =>
{
    t.tick("request!");
    apiSocket.apiCall('users', 'find', {}, (response) =>
    {
        t.tick("got response!");
    });
});
