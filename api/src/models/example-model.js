import mongoose from 'mongoose';

export const ItemSchema = new mongoose.Schema({
    name: String,
    ss: { type: String, default: "trash" },
    password: String,
});
export const Item = mongoose.model('Item', ItemSchema);
Item.Helpers = {
    public: (doc) =>
    {
        delete(doc.password);
        return doc;
    },
    fields: () =>
    {
        var fields = Object.keys(ItemSchema.paths);
        var results = [];
        for (var i = 0; i < fields.length; i++)
        {
            var settings = ItemSchema.paths[fields[i]];
            results.push({
                name : fields[i],
                type : settings.instance,
                defaultValue : settings.defaultValue,
                multiline : fields[i] == 'ss' ? true : undefined, //adding custom field options example! (recommended : multiline , readOnly )
            });
        }
        return results;
    }

}
/*
export const GameSchema = new mongoose.Schema({
    encode: String,
    users: Array,
    players: Array,
    userInfos: Array,
    walls: Array,
    turn: String,
    turnStartTime:String,
    winner: String,
    hasNaggedThisTurn : Boolean,
    defaultTurnTime : Number,
    nagTurnTime : Number,
    
    logs: Array,

    createdAt: String,
    updatedAt: String,
});
export const Game = mongoose.model('Game', GameSchema);
const GAME_BASE_URL = API_BASE_URL + 'games/';
const GAME_BASE_ADMIN_URL = BASE_URL + 'admin/games/';
Game.URLS = {
    apiSlug: () => '/api/games',
    adminSlug: () => '/admin/games',

    baseUrl: () => GAME_BASE_URL,
    get: () => GAME_BASE_URL,
    getOne: (id) => GAME_BASE_URL + id + '/',
    delete: (id) => GAME_BASE_URL + id + '/delete/',
    new: () => GAME_BASE_URL + 'new/',
    edit: (id) => GAME_BASE_URL + id + '/edit/',

    admin_new: () => GAME_BASE_ADMIN_URL + 'new/',
    admin_edit: (id) => GAME_BASE_ADMIN_URL + id + '/',


};
Game.Helpers = {
    public: (game) =>
    {

    },

};
Game.Helpers.public = (game) =>
{

};*/