import mongoose from 'mongoose';
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
export const MediaSchema = new mongoose.Schema({

    gameId: { type: String, default: '?' },
    champId: { type: String, default: '?' },

    title: { type: String, default: '' },
    slug: { type: String, default: '' },
    body: { type: String, default: '' },
    thumbnail: { type: String, default: '?' },
    url: { type: String, default: '?' },
    type: { type: String, default: '' },
    tags: Array,
    createdAt: String,
    updatedAt: String,
}, {
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true,
        }
    });
MediaSchema.virtual('thumbnail_url').get(function () {
    if (this.thumbnail != '' && this.thumbnail != '?')
        return this.thumbnail;
    const width = 150, height = 150;
    // console.log("thumbnail was empty lets rely on url!");
    var filePath = this.url;
    let fileName = filePath.substring(0, filePath.indexOf('.'));
    let fileFormat = filePath.substring(filePath.indexOf('.'), filePath.length);
    let file_resize = fileName + `-resize-${width}x${height}` + fileFormat;
    return file_resize;
    // if (fs.existsSync(path.resolve("../" + file_resize)))
    //     return file_resize;
    // else {
    //     console.log("file is not around!");
    //     Jimp.read(".." + filePath, (err, img) => {
    //         if (err) {
    //             console.log(err);
    //             return;
    //         }
    //         img
    //             // .resize(width, height)
    //             .cover(width,height,Jimp.VERTICAL_ALIGN_MIDDLE)
    //             .quality(60)
    //             .write(path.resolve(".." + fileName + '-resize-' + width + 'x' + height + fileFormat))
    //         console.log("file created => " + ".." + fileName + '-resize-' + width + 'x' + height + fileFormat);
    //     });
    //     return file_resize;
    // }
});

export const Media = mongoose.model('Media', MediaSchema);
Media.Helpers = {
    public: (doc) => {
        doc = doc.toObject();
        return doc;
    },
}