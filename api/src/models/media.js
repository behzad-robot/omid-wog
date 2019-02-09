import mongoose from 'mongoose';

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
// MediaSchema.virtual('thumbnail').get(function () {
//     let icon = this.icon;
//     if (icon == undefined)
//         return undefined;
//     if (icon.charAt(0) == '/')
//         icon = icon.substring(1);
//     let fileName = icon.substring(0, icon.indexOf('.'));
//     let fileFormat = icon.substring(icon.indexOf('.'), icon.length);
//     let icon_resized = fileName + '-resize-128x128' + fileFormat;
//     return icon_resized;
// });

export const Media = mongoose.model('Media', MediaSchema);
Media.Helpers = {
    public: (doc) => {
        doc = doc.toObject();
        return doc;
    },
}