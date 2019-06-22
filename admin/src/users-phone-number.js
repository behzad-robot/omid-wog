import { APICollection } from "./utils/api-helper";
import { API_TOKEN, ADMIN_TOKEN } from "./constants";
import { replaceAll } from "../../site-new/src/utils/utils";

const User = new APICollection('users', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });

const fs = require('fs');
const path = require('path');
User.find({}, 5000).then((users) =>
{
    let results = '';
    for (var i = 0; i < users.length; i++)
    {
        if (users[i].phoneNumber.indexOf('?') == -1)
        {
            console.log(users[i].phoneNumber);
            results += users[i].phoneNumber+'\n';
        }
        console.log(results);
        fs.writeFileSync(path.resolve('all-phonenumbers.txt'), results);
        console.log('DONE!');
    }
});