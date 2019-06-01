import { APICollection } from "./utils/api-helper";
import { API_TOKEN, ADMIN_TOKEN } from "./constants";

const User = new APICollection('users', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });

User.find({}, 20000).then((users) =>
{
    for (var i = 0; i < users.length; i++)
    {
        const u = users[i];
        // console.log(u.username);
        if (u.dota2Book2019 == undefined)
            continue;
        for (var j = 0; j < u.dota2Book2019.bets.length; j++)
        {
            if (u.dota2Book2019.bets[j].token == 'matchup_vici_gaming_vs_gambit_esports')
            {
                console.log(u.username + ' bet on vici vs gambit coins=' + u.dota2Book2019.bets[j].coins);
                console.log(u.username + ' old coins = ' + u.dota2Book2019.coins);
                u.dota2Book2019.coins += u.dota2Book2019.bets[j].coins;
                u.dota2Book2019.bets[j].token = u.dota2Book2019.bets[j].token + '-REMOVED';
                User.edit(u._id, { dota2Book2019: u.dota2Book2019 }).then((result) =>
                {
                    console.log(result.username + ' new coins = ' + result.dota2Book2019.coins);
                });
                break;
            }
        }
    }
});