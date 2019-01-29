import mongoose from 'mongoose';
import { API_BASE_URL } from '../../../admin/src/constants';

export const ChampionSchema = new mongoose.Schema({
    gameId: {type:String,default:''},
    name: String,
    slug: {type:String,default:''},
    icon: {type:String,default:'?'},
    icon_tall: {type:String,default:'?'},
    icon_gif: {type:String,default:'?'},
    cover: {type:String,default:'?'},
    cover2: {type:String,default:'?'},
    videoSpotlight: {type:String,default:'?'},
    description: {type:String,default:''},
    media: Array,

    lore: {type:String,default:'?'},
    loreUrl: {type:String,default:'?'},

    createdAt: String,
    updatedAt: String,

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


export const Champion = mongoose.model('Champion', ChampionSchema);
Champion.Helpers = {
    public: (doc) =>
    {
        return doc;
    },
}