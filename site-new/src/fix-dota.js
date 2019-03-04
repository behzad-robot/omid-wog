import MyExpressApp from "./libs/express";
import { log } from "./libs/log";
import { APICollection, APIProxy } from "./utils/api-helper";
import { API_TOKEN, ADMIN_TOKEN, GetMongoDBURL } from "./constants";
//db:
const User = new APICollection('users', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Game = new APICollection('games', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Admin = new APICollection('admins', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const Champion = new APICollection('champions', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const ChampBuild = new APICollection('builds', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
const ContactUsForm = new APICollection('contact-us-forms', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });

function isEmptyString(str) {
    return str == undefined || str == "undefined" || str == '' || str.replace(' ', '') == '' || str == '?';
}

// Game.find({}).then((games)=>{
//     // console.log(games);
//     for(var i = 0 ; i < games.length;i++)
//     {
//         var g = games[i];
//         if(isEmptyString(g.token))
//             continue;
//         for(var j = 0 ; j < g.items.length; j++)
//         {
//             if(g.items[j].icon.indexOf(`/${g.token}/`) == -1)
//                 g.items[j].icon = g.items[j].icon.replace('/storage/games/',`/storage/games/${g.token}/`);
//             console.log(g.items[j].icon);
//         }
//         Game.edit(g._id,g).then((result)=>{
//             console.log("Game Edited => "+result._id);
//         }).catch((err)=>{
//             console.llog(err.toString());
//         });
//     }
// }).catch((err)=>{
//     console.log(err.toString());
// });
// Game.find({}).then((games) => {
//     Champion.find({},5000).then((champs) => {
//         for (var i = 0; i < champs.length; i++) {
//             var c = champs[i];
//             var g = undefined;
//             for (var k = 0; k < games.length; k++) {
//                 if (games[k]._id == c.gameId) {
//                     g = games[k];
//                     break;
//                 }
//             }
//             if (isEmptyString(g.token))
//                 continue;
//             if (!isEmptyString(c.icon) && c.icon.indexOf(`/${g.token}/`) == -1)
//                 c.icon = c.icon.replace('/storage/champions/', `/storage/games/${g.token}/champions/`);
//             if (!isEmptyString(c.icon_gif) && c.icon_gif.indexOf(`/${g.token}/`) == -1)
//                 c.icon_gif = c.icon_gif.replace('/storage/champions/', `/storage/games/${g.token}/champions/`);
//             if (!isEmptyString(c.icon_tall) && c.icon_tall.indexOf(`/${g.token}/`) == -1)
//                 c.icon_tall = c.icon_tall.replace('/storage/champions/', `/storage/games/${g.token}/champions/`);
//             if (!isEmptyString(c.cover) && c.cover.indexOf(`/${g.token}/`) == -1)
//                 c.cover = c.cover.replace('/storage/champions/', `/storage/games/${g.token}/champions/`);
//             if (!isEmptyString(c.cover2) && c.cover2.indexOf(`/${g.token}/`) == -1)
//                 c.cover2 = c.cover2.replace('/storage/champions/', `/storage/games/${g.token}/champions/`);
//             for(var h = 0 ; h < c.abilities.length;h++)
//             {
//                 var a = c.abilities[h];
//                 if(!isEmptyString(a.icon) && a.icon.indexOf(`/${g.token}/`) == -1)
//                     a.icon = a.icon.replace('/storage/champions/', `/storage/games/${g.token}/champions/`);
//             }
//             console.log("looking up for game "+g.token);
//             Champion.edit(c._id,c).then((result)=>{
//                 console.log(`Champ edited ${result._id}`);
//             }).catch((err)=>{
//                 console.log(err.toString());
//             });
//         }
//     });
// });
