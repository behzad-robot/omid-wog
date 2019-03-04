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


// fixBuilds();
fixChamps();
function fixBuilds()
{
    var Build = new APICollection('builds', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
    Build.find({}, 2000).then((builds) =>
    {
        for (var i = 0; i < builds.length; i++)
        {
            builds[i].views = 50;
            Build.edit(builds[i]._id, { views: 50 }).then((result) =>
            {
                console.log('added views');
            });
        }
    });
}

function fixChamps()
{
    var Champion = new APICollection('champions', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
    Champion.find({ _draft: 'all' }, 6000).then((champions) =>
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
                for (var j = 0; j < champ.talents.length; j++)
                {
                    champ.talents[j].level = parseInt(champ.talents[j].level);
                }
                for(var j = 0 ; j < champ.stats.length; j++)
                {
                    champ.stats[j].value = champ.stats[j].value.toString();
                }
                Champion.edit(champ._id, { talents: champ.talents, roles: champ.roles , stats : champ.stats }).then((result) =>
                {
                    console.log(`UPDATED ${champ.name}`);
                });
            }
            else
                console.log('this was a mortal combat champ (was!!!)');
        }
    });
}