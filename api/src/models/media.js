import mongoose from 'mongoose';
import { isEmptyString, getResizedFileName } from '../utils/utils';
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
    _draft: Boolean,
}, {
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true,
        }
    });
MediaSchema.virtual('thumbnail_150x150').get(function ()
{
    var t = !isEmptyString(this.thumbnail) ? this.thumbnail : this.url;
    return getResizedFileName(t,150,150);
});
MediaSchema.virtual('thumbnail_350x350').get(function ()
{
    var t = !isEmptyString(this.thumbnail) ? this.thumbnail : this.url;
    return getResizedFileName(t,350,350);
});
MediaSchema.virtual('thumbnail_url').get(function ()
{
    var t = !isEmptyString(this.thumbnail) ? this.thumbnail : this.url;
    return t;
});

export const Media = mongoose.model('Media', MediaSchema);
Media.Helpers = {
    hasDraft: () => true,
    public: (doc) =>
    {
        doc = doc.toObject();
        return doc;
    },
}