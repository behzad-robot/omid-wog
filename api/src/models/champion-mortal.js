import mongoose from 'mongoose';
import { SITE_URL , API_BASE_URL} from '../constants';

export const MortalChampionSchema = new mongoose.Schema({
    gameId: {type:String,default:''},
    name: String,
    nickname : {type:String,default:''},
    slug: {type:String,default:''},
    icon: {type:String,default:'?'},
    icon_tall: {type:String,default:'?'},
    cover: {type:String,default:'?'},
    cover2: {type:String,default:'?'},
    videoSpotlight: {type:String,default:'?'},
    description: {type:String,default:''},
    descriptionPersian: {type:String,default:''},
    


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

MortalChampionSchema.virtual('icon_url').get(function ()
{
    let icon = this.icon;
    if (icon == undefined)
        return undefined;
    if (icon.charAt(0) == '/')
        icon = icon.substring(1);
    return icon.toString().indexOf("http") != -1 ? icon : (API_BASE_URL + icon);
});
MortalChampionSchema.virtual('icon_128x128').get(function ()
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
MortalChampionSchema.virtual('icon_256x256').get(function ()
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



export const MortalChampion = mongoose.model('Champion', MortalChampionSchema);
MortalChampion.Helpers = {
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
        return doc;
    },
}