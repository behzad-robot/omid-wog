import BehzadTimer from "./libs/behzad_timer";
import { API_TOKEN, ADMIN_TOKEN } from "./constants";
import fetch from 'node-fetch';
const request = require('request');
var WebSocketClient = require('websocket').client;

var t = new BehzadTimer();
// shine();
// die();
socket();
function shine() {
    t.tick('Request Go!');
    fetch('http://worldofgamers.ir:8585/api/users/', {
        headers: {
            'api-token': API_TOKEN,
            'admin-token': ADMIN_TOKEN,
        }
    })
        .then(response => response.json())
        .then((data) => {
            // console.log(data);
            t.tick('request done!');
            setTimeout(shine, 2000);
        });
}
function die() {
    t.tick("start");
    request('http://worldofgamers.ir:8585/api/users/', {
        json: true,
        headers: {
            'api-token': API_TOKEN,
            'admin-token': ADMIN_TOKEN,
        }
    }, (err, res, body) => {
        if (err) { return console.log(err); }
        t.tick("done!");
        // console.log(body)
        setTimeout(die, 2000);
    });
}
function socket() {
    console.log('studid shit');
    var s = new WebSocketClient();
    s.on('connect', (connection) => {
        console.log('connected');
        connection.on('error', function (error) {
            console.log("Connection Error: " + error.toString());
        });
        connection.on('close', function () {
            console.log('echo-protocol Connection Closed');
        });
        connection.on('message', function (message) {
            if (message.type === 'utf8') {
                // console.log("Received: '" + message.utf8Data + "'");
                var str = message.utf8Data;
                if(str == 'handshake-answer')
                    sendData(connection,'get-users');
                else
                {
                    t.tick('Response!');
                    setTimeout(()=>{
                        t.tick('request');
                        sendData(connection,'get-users');
                    },2000);
                }
            }
        });
        connection.send('handshake');
    });
    s.on('connectFailed', (err) => {
        console.log('connectFailed=>' + err);
    });
    s.connect('ws://localhost:8585/');
}
function sendData(socket,data){
    socket.send(data);
}