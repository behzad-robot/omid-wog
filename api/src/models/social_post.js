import mongoose, { ConnectionBase } from 'mongoose';
import { getResizedFileName, isEmptyString, ICON_404 } from '../utils/utils';
import { SITE_URL } from '../constants';
const moment = require('moment');
const jalaali = require('jalaali-js');
const persianDate = require('persian-date');
export const SocialPostSchema = new mongoose.Schema({
    //content , info:
    userId : String,
    gameId :{type:String,default:''},
    tags  :{type:Array,default:[]},
    media : {type:Array,default:[]}, //media may be one image,multiple images a video or multiple videos!
    body :{type:String,default:''},
    //stats:
    likes : {type:Array,default:[]},
    commentCount : {type:Number,default:0},

    createdAt: String,
    updatedAt: String,
    _draft: Boolean,
}, {
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true,
        }
    });
SocialPostSchema.virtual('createdAt_persian').get(function ()
{
    //2019-02-09 05:16:59
    var val = this.createdAt;
    if(isEmptyString(val))
        return val;
    
    if (val.indexOf('-') != -1 && val.indexOf(':') != -1 && val.indexOf(' ') != -1)
    {
        var parts = val.split(' ');
        // console.log(parts);
        var dateParts = parts[0].split('-');
        var year = parseInt(dateParts[0]);
        var month = parseInt(dateParts[1]);
        var day = parseInt(dateParts[2]);
        var timeParts = parts[1].split(':');
        var jj = jalaali.toJalaali(year, month, day) // { jy: 1395, jm: 1, jd: 23 }
        // return jj.jy + "-" + jj.jm + "-" + jj.jd + " " + parts[1];
        var pd = new persianDate([jj.jy,jj.jm,jj.jd]);
        return pd.format('dddd')+' '+jj.jd+' '+pd.format('MMMM')+' '+jj.jy;
    }
    else
        return this.createdAt;
});
SocialPostSchema.virtual('thumbnail_150x150').get(function ()
{
    return getResizedFileName(this.media[0], 150, 150);
});
SocialPostSchema.virtual('thumbnail_512x512').get(function ()
{
    return getResizedFileName(this.media[0], 512, 512);
});
export const SocialPost = mongoose.model('SocialPost', SocialPostSchema);
SocialPost.Helpers = {
    hasDraft: () => true,
    public: (doc) =>
    {
        doc = doc.toObject();
        if (isEmptyString(doc.thumbnail))
        {
            doc.thumbnail = ICON_404;
            doc.thumbnail_150x150 = ICON_404;
            doc.thumbnail_512x512 = ICON_404;
        }
        doc.thumbnail = SITE_URL(doc.thumbnail);
        doc.thumbnail_150x150 = SITE_URL(doc.thumbnail_150x150);
        doc.thumbnail_512x512 = SITE_URL(doc.thumbnail_512x512);
        return doc;
    },
}