import BehzadTimer from "./libs/behzad_timer";
import { API_TOKEN, ADMIN_TOKEN } from "./constants";
import fetch from 'node-fetch';
var t = new BehzadTimer();
t.tick('Request Go!');
fetch('http://localhost:8585/api/users/H', {
    headers: {
        'api-token': API_TOKEN,
        'admin-token': ADMIN_TOKEN,
    }
})
    .then(response => response.json())
    .then((data) => {
        console.log(data);
        t.tick('request done!');
    });