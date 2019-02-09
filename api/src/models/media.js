import mongoose from 'mongoose';

export const Media = new mongoose.Schema({

    gameId: {type:String,default:'?'},
    champId: {type:String,default:'?'},

    title: {type:String,default:''},
    slug: {type:String,default:''},
    body: {type:String,default:''},
    url : {type:String,default:''},
    type : {type:String,default:''},
    tags : Array,    
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