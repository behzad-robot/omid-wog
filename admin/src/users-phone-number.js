import { APICollection } from "./utils/api-helper";
import { API_TOKEN, ADMIN_TOKEN } from "./constants";
import { replaceAll } from "../../site-new/src/utils/utils";

const User = new APICollection('users', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });

const fs = require('fs');
const path = require('path');
User.find({}, 5000).then((users) =>
{
    let numbers = '';
    for (var i = 0; i < users.length; i++)
    {
        if (users[i].fortnite2019 != undefined && users[i].fortnite2019.hasJoined)
        {
            if(users[i].phoneNumber.indexOf('?') == -1)
                numbers += users[i].phoneNumber + '\n';
        }
        console.log(numbers);
        fs.writeFileSync(path.resolve('fortnite-numbers.txt'),numbers);
        console.log('DONE!');
    }
});