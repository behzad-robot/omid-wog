import mongoose from 'mongoose';

export const GameSchema = new mongoose.Schema({
    name: String,
    token: {type:String,default:''},
    slug: {type:String,default:''},
    description: {type:String,default:''},
    icon : {type:String,default:'?'},
    cover : {type:String,default:'?'},
    category : {type:String,default:'?'},
    ageRange : {type:String,default:''},
    images : Array,
    media: Array,//{type , url}
    items: Array,
    //league only:
    summonerSpells:Array, // { name , icon , description , level , range , coolDown}
    runes:Array, // {tree , name , icon , description , depth , bonus}
    patchNotes:Array, // {title : string , html : string}
    
    createdAt:String,
    updatedAt:String,
});
export const Game = mongoose.model('Game', GameSchema);
Game.Helpers = {
    public: (doc) =>
    {
        return doc;
    },
}