//api functions
const API_BASE_URL = "/api/";
const API = {
    modelListUrl: (modelName) => (API_BASE_URL + modelName + "/"),
    modelSingleUrl: (modelName, _id) => (API_BASE_URL + modelName + "/" + _id + "/"),
};
const apiCall = (url, next) =>
{
    console.log(url);
    console.log(url + '=>' + Date.now());
    fetch(url + '?_draft=all&limit=800',
        {
            method: 'GET',
            mode: "cors",
            headers: {
                'api-token': 'ftsb',
                "admin-token": "hamunhamishegi",
            }
        })
        .then((response) => (response.json()))
        .then((json) =>
        {
            next(json);
            console.log(url + '=>' + Date.now());
        });
}
const findObjects = (name, next) =>
{
    var params = '';
    if (typeof name == 'object')
    {
        var settings = Object.assign({}, name);
        name = settings.name;
        params = settings.params ? settings.params : '';
    }
    console.log(`findObjects ${name} from ` + API.modelListUrl(name));
    apiCall(API.modelListUrl(name) + params, next);
}
const getObject = (name, _id, next) =>
{
    console.log(`getObject ${name} from ` + API.modelListUrl(name));
    apiCall(API.modelSingleUrl(name, _id), next);
}
const hasArabicLetter = (str) =>
{
    var arabic = /[\u0600-\u06FF]/;
    return arabic.test(str);
}
function isEmptyString(str)
{
    return str == undefined || str == "undefined" || str == '' || str.replace(' ', '') == '' || str == '?';
}
const getAdmins = (next) =>
{
    fetch('/api/users/get-admins' + '?_draft=all',
        {
            method: 'GET',
            mode: "cors",
            headers: {
                'api-token': 'ftsb',
                "admin-token": "hamunhamishegi",
            }
        })
        // .then((response)=>(response.text())).then((text)=>{
        //     console.log(text);
        // });
        .then((response) => (response.json()))
        .then((json) =>
        {
            next(json);
            console.log(url + '=>' + Date.now());
        });
};