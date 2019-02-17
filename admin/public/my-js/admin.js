
const ADMIN_API_BASE_URL = "/api/";
const AdminAPI = {
    modelListUrl: (modelName) => (ADMIN_API_BASE_URL + modelName + "/"),
    modelSingleUrl: (modelName, _id) => (ADMIN_API_BASE_URL + modelName + "/" + _id + "/"),
    apiCall: (url, next) =>
    {
        console.log(url + '=>' + Date.now());
        fetch(url + '?_draft=all',{
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
        });
    },
};
const
const findObjects = (name, next) =>
{
    console.log(`findObjects ${name} from ` + API.modelListUrl(name));
    apiCall(API.modelListUrl(name), next);
}
const getObject = (name, _id, next) =>
{
    console.log(`getObject ${name} from ` + API.modelListUrl(name));
    apiCall(API.modelSingleUrl(name, _id), next);
}
