import mongoose from 'mongoose';
import { SITE_URL ,API_BASE_URL } from '../constants';
/*
    Champion is playable character.
    Used for games:
    - dota 2
    - league of legends
    - vain glory
    - mortal kombat
 */
export const ChampionSchema = new mongoose.Schema({
    gameId: {type:String,default:''},
    name: String,
    nickname : {type:String,default:''},
    slug: {type:String,default:''},
    icon: {type:String,default:'?'},
    icon_tall: {type:String,default:'?'},
    icon_gif: {type:String,default:'?'},
    cover: {type:String,default:'?'},
    cover2: {type:String,default:'?'},
    videoSpotlight: {type:String,default:'?'},
    description: {type:String,default:''},
    descriptionPersian: {type:String,default:''},

    lore: {type:String,default:'?'},
    loreUrl: {type:String,default:'?'},

    //lol,dota:
    roles: Array, //{name , playRate}
    /*
        dota abilities:
        {
            icon , title , video , description , btn
            primary : boolean ,
            aghanimUpgrade : boolean,
            psi : boolean,
            dmgType : string,
            castingMethod : string,
            targetingMethod : string,
            allowedTargets : string,
        }
    */
    abilities: Array,
    stats: Array, //{ name : string , value : string}
    talents: Array, //{level : int , a : string , b : string}
    //dota:
    attackType: {type:String,default:''},
    primaryAttr: {type:String,default:''},
    //mortal combat:
    variations : Array , // { name : string , icon : string , moves :[] }
    moves : Array, //{ _id : int , name : string, description : string, video : string, keys : string [] }
    
    
    createdAt: String,
    updatedAt: String,
    _draft : {type : Boolean , default : false},
}, {
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true,
        }
    });

ChampionSchema.virtual('icon_url').get(function ()
{
    let icon = this.icon;
    if (icon == undefined)
        return undefined;
    if (icon.charAt(0) == '/')
        icon = icon.substring(1);
    return icon.toString().indexOf("http") != -1 ? icon : (API_BASE_URL + icon);
});
ChampionSchema.virtual('icon_128x128').get(function ()
{
    let icon = this.icon;
    if (icon == undefined)
        return undefined;
    if (icon.charAt(0) == '/')
        icon = icon.substring(1);
    let fileName = icon.substring(0, icon.indexOf('.'));
    let fileFormat = icon.substring(icon.indexOf('.'), icon.length);
    let icon_128x128 = fileName + '-resize-128x128' + fileFormat;
    return icon_128x128.indexOf("http") != -1 ? icon_128x128 : (API_BASE_URL + icon_128x128);
});
ChampionSchema.virtual('icon_256x256').get(function ()
{
    let icon = this.icon;
    if (icon == undefined)
        return undefined;
    if (icon.charAt(0) == '/')
        icon = icon.substring(1);
    let fileName = icon.substring(0, icon.indexOf('.'));
    let fileFormat = icon.substring(icon.indexOf('.'), icon.length);
    let icon_128x128 = fileName + '-resize-256x256' + fileFormat;
    return icon_128x128.indexOf("http") != -1 ? icon_128x128 : (API_BASE_URL + icon_128x128);
});
ChampionSchema.virtual('_stats').get(function ()
{
    let stats = this.stats;
    let result = {};
    for(var i = 0 ; i < stats.length;i++)
    {
        var s = stats[i];
        result[s.name] = s.value;
    }
    return result;
});


export const Champion = mongoose.model('Champion', ChampionSchema);
Champion.Helpers = {
    hasDraft : () => true ,
    public: (doc) =>
    {
        if(doc.icon)
            doc.icon = SITE_URL(doc.icon);
        if(doc.icon_tall)
            doc.icon_tall = SITE_URL(doc.icon_tall);
        if(doc.icon_gif)
            doc.icon_gif = SITE_URL(doc.icon_gif);
        if(doc.cover)
            doc.cover = SITE_URL(doc.cover);
        if(doc.cover2)
            doc.cover2 = SITE_URL(doc.cover2);
        if(doc.abilities)
        {
            for(var i = 0 ; i < doc.abilities.length;i++)
            {
                if(doc.abilities[i].icon)
                    doc.abilities[i].icon = SITE_URL(doc.abilities[i].icon);
            }
        }
        return doc;
    },
}