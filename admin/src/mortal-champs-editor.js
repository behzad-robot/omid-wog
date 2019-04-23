import { APICollection } from "./utils/api-helper";
import { API_TOKEN, ADMIN_TOKEN } from "./constants";

const Champion = new APICollection('champions', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });

Champion.find({ gameId: '5c6411967394a078f182e662' }, 20000).then((champs) =>
{
    for (var i = 0; i < champs.length; i++)
    {
        console.log(champs[i].name);
        const champ = champs[i];
        for (var j = 0; j < champ.moves.length; j++)
        {
            let name = champ.moves[j].name;
            champ.moves[j].isSpecial = name.indexOf('*') != -1;
            champ.moves[j].name = name.replace('*','');
        }
        Champion.edit(champ._id,{moves : champ.moves}).then((c)=>{
            console.log(c.name+" edited!");
        });
    }
});