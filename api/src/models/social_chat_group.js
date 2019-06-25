import mongoose from 'mongoose';
import { getResizedFileName, isEmptyString, ICON_404 } from '../utils/utils';
import { SITE_URL } from '../constants';
const jalaali = require('jalaali-js');
const persianDate = require('persian-date');
/*
    A comment can be used for any objectType meaning any other model class as long as it provides _id field(objectId)
    (Meaning that we can use comments for nested/weak entities.)
 */
export const SocialChatGroupSchema = new mongoose.Schema({
    name : {type : String , default : ''},
    cover : {type : String , default : ''},
    description : {type : String , default : ''},

    createdAt: String,
    updatedAt: String,
    _draft: { type: Boolean, default: true },
}, {
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true,
        }
    });
SocialChatGroupSchema.virtual('createdAt_persian').get(function ()
{
    //2019-02-09 05:16:59
    var val = this.createdAt;
    if (isEmptyString(val))
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
        var pd = new persianDate([jj.jy, jj.jm, jj.jd]);
        return pd.format('dddd') + ' ' + jj.jd + ' ' + pd.format('MMMM') + ' ' + jj.jy;
    }
    else
        return this.createdAt;
});
export const SocialChatGroup = mongoose.model('SocialChatGroup', SocialChatGroupSchema);
SocialChatGroup.Helpers = {
    hasDraft: () => true,
    public: (doc) =>
    {
        doc = doc.toObject();
        return doc;
    },
}