import mongoose, { ConnectionBase } from 'mongoose';
import { getResizedFileName, isEmptyString, ICON_404 } from '../utils/utils';
import { SITE_URL } from '../constants';
const moment = require('moment');
const jalaali = require('jalaali-js');
const persianDate = require('persian-date');
export const SocialNotificationSchema = new mongoose.Schema({
    actionUserId: { type: String, default: '' },
    targetUserId: { type: String, default: '' },
    postId: { type: String, default: '' },
    commentId: { type: String, default: '' },
    type: { type: String, default: '' }, //like-post,like-comment,follow-user,post-comment
    read: { type: Boolean, default: false },
    createdAt: String,
}, {
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true,
        }
    });
SocialNotificationSchema.virtual('createdAt_persian').get(function ()
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
export const SocialNotification = mongoose.model('SocialNotification', SocialNotificationSchema);
SocialNotification.Helpers = {
    hasDraft: () => false,
    public: (doc) =>
    {
        doc = doc.toObject();
        return doc;
    },
}