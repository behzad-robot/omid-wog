//api functions
const API_BASE_URL = "/api/";
const API = {
    modelListUrl: (modelName) => (API_BASE_URL + modelName + "/"),
    modelSingleUrl: (modelName, _id) => (API_BASE_URL + modelName + "/" + _id + "/"),
};
const apiCall = (url, next) => {
    console.log(url);
    fetch(url,
        {
            method: 'GET',
            mode: "cors",
            headers: {
                'api-token': 'ftsb',
                "admin-token": "hamunhamishegi",
            }
        })
        .then((response) => (response.json()))
        .then((json) => {
            next(json);
        });
}
const findObjects = (name, params, next) => {
    console.log(`findObjects ${name} from ` + API.modelListUrl(name));
    apiCall(API.modelListUrl(name) + params, next);
}
const getObject = (name, _id, next) => {
    console.log(`getObject ${name} from ` + API.modelListUrl(name));
    apiCall(API.modelSingleUrl(name, _id), next);
}







const ICON_404 = '/images/404-image.png';
function isEmptyString(str) {
    return str == undefined || str == "undefined" || str == '' || str.replace(' ', '') == '' || str == '?';
}
const _fixGame = (game) => {
    const g = game;
    for (var i = 0; i < g.items.length; i++) {
        if (isEmptyString(g.items[i].icon))
            g.items[i].icon = ICON_404;
    }
    g.getItem = (_id) => {
        // console.log(g);
        for (var j = 0; j < g.items.length; j++)
            if (g.items[j]._id == _id)
                return g.items[j];
        return undefined;
    }
    return g;
}
const getGame = (_id, next) => {
    getObject('games', _id, (game) => {
        game = _fixGame(game);
        next(game);
    });
};
const getGames = (params, next) => {
    findObjects('games', params, (games) => {
        for (var i = 0; i < games.length; i++) {
            games[i] = _fixGame(games[i]);
        }
        next(games);
    });
};

//champs:
const _fixChamp = (champ) => {
    if (isEmptyString(champ.icon))
        champ.icon = ICON_404;
    if (isEmptyString(champ.icon_gif))
        champ.icon_gif = champ.icon;
    return champ;
};
const getChampions = (params, next) => {
    findObjects('champions', params, (champions) => {
        for (var i = 0; i < champions.length; i++)
            champions[i] = _fixChamp(champions[i]);
        next(champions);
    });
}
const getBuilds = (params, game, champions, next) => {
    findObjects('builds', params, (builds) => {
        for (var i = 0; i < builds.length; i++) {
            const b = builds[i];
            //set _champ:
            for (var j = 0; j < champions.length; j++) {
                if (b.champId == champions[j]._id) {
                    b._champ = champions[j];
                    break;
                }
            }
            //set _items:
            for (var j = 0; j < b.itemRows.length; j++) {
                var row = b.itemRows[j];
                row._items = [];
                for (var k = 0; k < row.items.length; k++) {
                    row._items.push(game.getItem(row.items[k]));
                }
            }
            console.log(b);
        }
        next(builds);
    });
};
const loadedUsers = [];
//users:
const getUser = (_id, next) => {
    for(var i = 0 ; i < loadedUsers.length;i++)
    {
        if(loadedUsers[i]._id == _id)
        {
            next(loadedUsers[i]);
            return;
        }
    }
    getObject('users',_id,(user)=>{
        loadedUsers.push(user);
        next(user);
    });
};
//streamers:
getTwitchStreamersFor = (gameId,next,settings={})=>{
    fetch('https://api.twitch.tv/helix/streams?game_id='+gameId,
        {
            method: 'GET',
            mode: "cors",
            headers: {
                'Client-ID' : '3j5qf1r09286hluj7rv4abqkbqosk3'
            }
        })
        .then((response) => (response.json()))
        .then((arr) => {
            console.log(arr);
            var streamers = [];
            for(var i = 0 ; i < arr.length;i++)
            {
                streamers.push({
                    id : arr[i].id,
                    userId : arr[i].user_id,
                    username : arr[i].user_name,
                    title : arr[i].title,
                    thumbnail :  arr[i].thumbnail.replace('{width}',640).replace('{height}',480),
                    viewerCount : arr[i].viewer_count,

                });
            }
            next(streamers);
        });
};