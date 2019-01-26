//api functions
const API_BASE_URL = "/api/";
const API = {
    modelListUrl: (modelName) => (API_BASE_URL + modelName + "/"),
    modelSingleUrl: (modelName, _id) => (API_BASE_URL + modelName + "/" + _id + "/"),
};
const apiCall = (url, next) =>
{
    console.log(url);
    fetch(url,
        {
            method : 'GET',
            mode : "cors",
            headers: {
                // 'api-token': 'forthehorde',
                // "admin-token":"hamunhamishegi",
            }
        })
        .then((response) => (response.json()))
        .then((json) =>
        {            
            next(json);
        });
}
const findObjects = (name, next) =>
{
    console.log(`findObjects ${name} from ` + API.modelListUrl(name));
    apiCall(API.modelListUrl(name), next);
}
const getObject = (name, _id, next) =>
{
    console.log(`getObject ${name} from ` + API.modelListUrl(name));
    apiCall(API.modelSingleUrl(name,_id), next);
}
