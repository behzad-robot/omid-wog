import BehzadTimer from "./libs/behzad_timer";
import { APISocket } from "./utils/api-socket";
import { APICollection } from "./utils/api-helper";
import { API_TOKEN } from "../../api/src/constants";
import { ADMIN_TOKEN } from "./constants";
const request = require('request');
var WebSocketClient = require('websocket').client;

var t = new BehzadTimer();
// shine();
// die();

// var apiSocket = new APISocket();
// t.tick("init!");
// apiSocket.connect(() =>
// {
//     t.tick("request!");
//     apiSocket.apiCall('users', 'find', {}, (response) =>
//     {
//         t.tick("got response!");
//     });
// });

var Champion = new APICollection('champions', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
Champion.find({}).then((champions) =>
{
    for (var i = 0; i < champions.length; i++)
    {
        const champ = champions[i];
        console.log(`checking ${champ.name}`);
        if (champ.roles != undefined && champ.roles != 0)
        {
            console.log(`applying to ${champ.name}`);
            for (var j = 0; j < champ.roles.length; j++)
            {
                champ.roles[j].playRate = parseInt(champ.roles[j].playRate);
            }
            Champion.edit(champ._id, { roles: champ.roles }).then((result) =>
            {
                console.log(`UPDATED ${champ.name}`);
            });
        }
        else
            console.log('this was a mortal combat champ (was!!!)');
    }
});