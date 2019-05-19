import mongoose from 'mongoose';
import { getResizedFileName, isEmptyString, ICON_404 } from '../utils/utils';
const moment = require('moment');
const jalaali = require('jalaali-js');
const persianDate = require('persian-date');
export const ChampionBuildSchema = new mongoose.Schema({
    title: String,
    slug: { type: String, default: '' },
    //ownership fields:
    userId: { type: String, default: '?' },
    gameId: { type: String, default: '?' },
    champId: { type: String, default: '?' },
    //data fields:
    patch: { type: String, default: '' },
    description: { type: String, default: '' },
    itemRows: [], // {title : string , notes: string , items : [] }
    talents: [], // {level : int , pick : string (a/b)}
    abilities: [],
    //views,votes,comments:
    views: {type:Number,default:0},
    upVotes: Array,
    downVotes: Array,
    comments: Array,
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
ChampionBuildSchema.virtual('createdAt_persian').get(function ()
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
export const ChampionBuild = mongoose.model('Build', ChampionBuildSchema);
ChampionBuild.Helpers = {
    hasDraft: () => true,
    public: (doc) =>
    {
        return doc;
    },
}