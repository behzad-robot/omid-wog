import mongoose, { ConnectionBase } from 'mongoose';
const moment = require('moment');
const jalaali = require('jalaali-js');
const fs = require('fs');
const Jimp = require('jimp');
export const PostSchema = new mongoose.Schema({
    title: String,
    intro: String,
    body: String,
    slug: String,
    thumbnail: String,
    authorId: {type:String,default:''},
    gameId: String,
    tags: Array,
    categories: Array,

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
PostSchema.virtual('createdAt_persian').get(function () {
    //2019-02-09 05:16:59
    var val = this.createdAt;
    if (val.indexOf('-') != -1 && val.indexOf(':') != -1 && val.indexOf(' ') != -1) {
        var parts = val.split(' ');
        // console.log(parts);
        var dateParts = parts[0].split('-');
        var year = parseInt(dateParts[0]);
        var month = parseInt(dateParts[1]);
        var day = parseInt(dateParts[2]);
        var timeParts = parts[1].split(':');
        var jj = jalaali.toJalaali(year, month, day) // { jy: 1395, jm: 1, jd: 23 }
        return jj.jy + "-" + jj.jm + "-" + jj.jd + " " + parts[1];
    }
    else
        return this.createdAt;
});
PostSchema.virtual('thumbnail_150x150').get(function () {
    const width = 150, height = 150;
    // console.log("thumbnail was empty lets rely on url!");
    var filePath = this.thumbnail;
    let fileName = filePath.substring(0, filePath.indexOf('.'));
    let fileFormat = filePath.substring(filePath.indexOf('.'), filePath.length);
    let file_resize = fileName + `-resize-${width}x${height}` + fileFormat;
    return file_resize;
});
PostSchema.virtual('thumbnail_640x480').get(function () {
    const width = 640, height = 480;
    // console.log("thumbnail was empty lets rely on url!");
    var filePath = this.thumbnail;
    let fileName = filePath.substring(0, filePath.indexOf('.'));
    let fileFormat = filePath.substring(filePath.indexOf('.'), filePath.length);
    let file_resize = fileName + `-resize-${width}x${height}` + fileFormat;
    return file_resize;
});
export const Post = mongoose.model('Post', PostSchema);
Post.Helpers = {
    hasDraft: () => true,
    public: (doc) => {
        return doc;
    },
}