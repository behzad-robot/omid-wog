import mongoose from 'mongoose';

export const ChampionBuildSchema = new mongoose.Schema({
    title: String,
    slug: {type:String,default:''},
    //ownership fields:
    userId : {type:String,default:'?'},
    gameId : {type:String,default:'?'},
    champId : {type:String,default:'?'},
    //data fields:
    patch :  {type:String,default:''},
    description: {type:String,default:''},
    itemRows : [], // {title : string , notes: string , items : [] }
    talents : [] , // {level : int , pick : string (a/b)}
    //views,votes,comments:
    views : Number,
    upVotes :Array,
    downVotes : Array,
    comments : Array,
    createdAt:String,
    updatedAt:String,
});
export const ChampionBuild = mongoose.model('Build', ChampionBuildSchema);
ChampionBuild.Helpers = {
    public: (doc) =>
    {
        return doc;
    },
}