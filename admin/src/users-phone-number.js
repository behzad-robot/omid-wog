import { APICollection } from "./utils/api-helper";
import { API_TOKEN, ADMIN_TOKEN } from "./constants";
import { replaceAll } from "../../site-new/src/utils/utils";

const User = new APICollection('users', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });

const fs = require('fs');
const path = require('path');
User.find({}, 5000).then((users) =>
{
    let results = [];
    for (var i = 0; i < users.length; i++)
    {
        if (users[i].fortnite2019 != undefined && users[i].fortnite2019.hasJoined)
        {
            // if(users[i].phoneNumber.indexOf('?') == -1)
            // results += users[i].username + '\t' + users[i].phoneNumber + '\t' + users[i].epicGamesID + '\t' + users[i].psnID + '\n';
            let d ={
                _id : users[i]._id,
                username : users[i].username,
                phoneNumber : users[i].phoneNumber,
                epicGamesID : users[i].epicGamesID,
                psnID : users[i].psnID,
            };
            console.log(d);
            results.push(d);
        }
        console.log(results);
        fs.writeFileSync(path.resolve('fortnite-info.txt'), JSON.stringify(results));
        console.log('DONE!');
    }
});