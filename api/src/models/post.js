import mongoose, { ConnectionBase } from 'mongoose';
import { getResizedFileName, isEmptyString, ICON_404 } from '../utils/utils';
import { SITE_URL } from '../constants';
const moment = require('moment');
const jalaali = require('jalaali-js');
const persianDate = require('persian-date');
export const PostSchema = new mongoose.Schema({
    title: String,
    intro: String,
    body: String,
    slug: String,
    thumbnail: String,
    authorId: { type: String, default: '' },
    gameId: String,
    tags: Array,
    categories: Array,
    _seo: Object,
    extras : {
        type:Object,
        default:{bigBox : false,}
    },
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
PostSchema.virtual('createdAt_persian').get(function ()
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
        var pd = new persianDate([year,month,day]);
        return pd.format('dddd')+' '+day+' '+pd.format('MMMM')+' '+jj.jy;
    }
    else
        return this.createdAt;
});
PostSchema.virtual('thumbnail_150x150').get(function ()
{
    return getResizedFileName(this.thumbnail, 150, 150);
});
PostSchema.virtual('thumbnail_640x480').get(function ()
{
    return getResizedFileName(this.thumbnail, 640, 480);
});
PostSchema.virtual('thumbnail_800x600').get(function ()
{
    return getResizedFileName(this.thumbnail, 800, 600);
});
export const Post = mongoose.model('Post', PostSchema);
Post.Helpers = {
    hasDraft: () => true,
    public: (doc) =>
    {
        doc = doc.toObject();
        if (isEmptyString(doc.thumbnail))
        {
            doc.thumbnail = ICON_404;
            doc.thumbnail_150x150 = ICON_404;
            doc.thumbnail_640x480 = ICON_404;
        }
        doc.thumbnail = SITE_URL(doc.thumbnail);
        doc.thumbnail_150x150 = SITE_URL(doc.thumbnail_150x150);
        doc.thumbnail_640x480 = SITE_URL(doc.thumbnail_640x480);
        if(doc.extras == undefined){
            doc.extras = {
                bigBox : false,
            }
        }
        return doc;
    },
}