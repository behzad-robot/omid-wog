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
                'api-token': 'ftsb',
                "admin-token":"hamunhamishegi",
            }
        })
        .then((response) => (response.json()))
        .then((json) =>
        {            
            next(json);
        });
}
const findObjects = (name,params, next) =>
{
    console.log(`findObjects ${name} from ` + API.modelListUrl(name));
    apiCall(API.modelListUrl(name)+params, next);
}
const getObject = (name, _id, next) =>
{
    console.log(`getObject ${name} from ` + API.modelListUrl(name));
    apiCall(API.modelSingleUrl(name,_id), next);
}

getGames = (params,next)=>{
    findObjects('games',params,(games)=>{
        for(var i = 0 ; i < games.length; i++)
        {
            const g = games[i];
            games[i].getItem = (_id) =>{
                // console.log(g);
                for(var j = 0 ; j < g.items.length;j++)
                    if(g.items[j]._id == _id)
                        return g.items[j];
                return undefined;
            }
        }
        next(games);
    });
};