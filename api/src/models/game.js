import mongoose from 'mongoose';
import { SITE_URL } from '../constants';

export const GameSchema = new mongoose.Schema({
    name: String,
    token: {type:String,default:''},
    slug: {type:String,default:''},
    description: {type:String,default:''},
    icon : {type:String,default:'?'},
    cover : {type:String,default:'?'},
    coverTall : {type:String,default:'?'},
    category : {type:String,default:'?'},
    ageRange : {type:String,default:''},
    images : Array,
    media: Array,//{type , url}
    items: Array,
    /*
        {
            icon : string
            name : string
            slug : string,
            category : string
            price : string,
            coolDown : string
            manaCost : string
            shop : string
            description : string,
            children : [],
        }
     */
    //league only:
    summonerSpells:Array, // { name , icon , description , level , range , coolDown}
    runes:Array, // {tree , name , icon , description , depth , bonus}
    patchNotes:Array, // {title : string , body : string}
    
    createdAt:String,
    updatedAt:String,
    _draft : Boolean,
    
});
export const Game = mongoose.model('Game', GameSchema);
Game.Helpers = {
    hasDraft : () => true ,
    public: (doc) =>
    {
        if(doc.icon)
            doc.icon = SITE_URL(doc.icon);
        if(doc.cover)
            doc.cover = SITE_URL(doc.cover);
        if(doc.coverTall)
            doc.coverTall = SITE_URL(doc.coverTall);
        if(doc.items && doc.items.length != 0)
        {
            for(var i = 0 ; i < doc.items.length;i++)
            {
                if(doc.items[i].icon)
                    doc.items[i].icon = SITE_URL(doc.items[i].icon);
            }
        }
        return doc;
    },
}