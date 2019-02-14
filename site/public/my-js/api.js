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
const findObjectsPost = (name, body, next) => {
    console.log(`findObjectsPost  ${name} from API.modelListUrl(name)`);
    fetch(API.modelListUrl(name),
        {
            method: 'POST',
            mode: "cors",
            headers: {
                'api-token': 'ftsb',
                "admin-token": "hamunhamishegi",
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        })
        .then((response) => (response.json()))
        .then((json) => {
            console.log(json);
            next(json);
        });
};






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
    if (isEmptyString(g.cover))
        g.cover = ICON_404;
    if (isEmptyString(g.icon))
        g.icon = ICON_404;
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
        champ.icon_gif = champ.icon_tall;
    champ.siteUrl = '/champions/' + champ.slug;
    champ.roles_str = '';
    for (var i = 0; i < champ.roles.length; i++)
        champ.roles_str += champ.roles[i].name + ' , ';
    champ.roles_str = champ.roles_str.substring(0, champ.roles_str.length - 1);
    return champ;
};
const getChampions = (params, next) => {
    findObjects('champions', params, (champions) => {
        for (var i = 0; i < champions.length; i++)
            champions[i] = _fixChamp(champions[i]);
        next(champions);
    });
}
const getChampion = (_id, next) => {
    getObject('champions', _id, (c) => {
        next(_fixChamp(c));
    });
}
//builds:
const _fixBuild = (b, game, champion) => {
    b._champ = champion;
    //set _items:
    for (var j = 0; j < b.itemRows.length; j++) {
        var row = b.itemRows[j];
        row._items = [];
        for (var k = 0; k < row.items.length; k++) {
            row._items.push(game.getItem(row.items[k]));
        }
    }
    b.siteUrl = '/builds/' + b._id;
    return b;
};
const getBuild = (_id, game, champion, next) => {
    getObject('builds', _id, (b) => {
        if (game != undefined)
            next(_fixBuild(b, game, champion));
        else {
            getGame(b.gameId, (g) => {
                game = g;
                b._game = game;
                getChampion(b.champId, (c) => {
                    champion = c;
                    b._champion = champion;
                    next(_fixBuild(b, game, champion));
                });
            });
        }
    });
};
const getBuilds = (params, game, champions, next) => {
    findObjects('builds', params, (builds) => {
        for (var i = 0; i < builds.length; i++) {
            let b = builds[i];
            //set _champ:
            for (var j = 0; j < champions.length; j++) {
                if (b.champId == champions[j]._id) {
                    b._champ = champions[j];
                    break;
                }
            }
            b = _fixBuild(b, game, b._champ);
            console.log(b);
        }
        next(builds);
    });
};
const loadedUsers = [];
//users:
const _fixUser = (u) => {
    if (isEmptyString(u.profileImage))
        u.profileImage = '/images/user-profile-default.png';
    if(isEmptyString(u.cover))
        u.cover = '/images/poro-pool.jpg';
    return u;
}
const getUser = (_id, next) => {
    for (var i = 0; i < loadedUsers.length; i++) {
        if (loadedUsers[i]._id == _id) {
            next(loadedUsers[i]);
            return;
        }
    }
    getObject('users', _id, (user) => {
        loadedUsers.push(_fixUser(user));
        next(user);
    });
};
const getUsers = (params, next) => {
    findObjects('users', params, (users) => {
        for (var i = 0; i < users.length; i++) {
            users[i] = _fixUser(users[i]);
            loadedUsers.push(users[i]);
        }
        next(users);
    });
};
//media:
const _fixMedia = (m) => {
    if (isEmptyString(m.url))
        m.url = ICON_404;
    if (isEmptyString(m.thumbnail))
        m.thumbnail = ICON_404;
    m.siteUrl = '/media/' + m.slug;
    return m;
};
const getMedia = (params, next) => {
    findObjects('media', params, (ms) => {
        console.log("got some media!");
        for (var i = 0; i < ms.length; i++) {
            ms[i] = _fixMedia(ms[i]);
            ms[i].siteUrl = '/media/' + ms[i]._id;
        }
        next(ms);
    });
}
//posts:
const _fixPost = (p) => {
    if (isEmptyString(p.media))
        p.media = ICON_404;
    p.siteUrl = '/posts/' + p.slug;
    return p;
};
const getPosts = (params, next) => {
    findObjects('posts', params, (posts) => {
        for (var i = 0; i < posts.length; i++)
            posts[i] = _fixPost(posts[i]);
        next(posts);
    });
};

//streamers:
getTwitchStreamersFor = (gameId, next, settings = {}) => {
    fetch('https://api.twitch.tv/helix/streams?game_id=' + gameId,
        {
            method: 'GET',
            mode: "cors",
            headers: {
                'Client-ID': '3j5qf1r09286hluj7rv4abqkbqosk3'
            }
        })
        .then((response) => (response.json()))
        .then((js) => {
            console.log(js);
            var arr = js.data;
            var streamers = [];
            for (var i = 0; i < arr.length; i++) {
                streamers.push({
                    id: arr[i].id,
                    userId: arr[i].user_id,
                    username: arr[i].user_name,
                    url: "https://twitch.tv/" + arr[i].user_name,
                    title: arr[i].title,
                    thumbnail: arr[i].thumbnail_url.replace('{width}', 640).replace('{height}', 360),
                    viewerCount: arr[i].viewer_count,

                });
            }
            console.log(streamers);
            next(streamers);
        });
};