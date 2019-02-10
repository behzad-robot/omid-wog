import mongoose from 'mongoose';
import { JesEncoder } from '../utils/jes-encoder';
import { API_ENCODE_KEY } from '../constants';
const encoder = new JesEncoder(API_ENCODE_KEY);
export const PostCategorySchema = new mongoose.Schema({
    name : {type:String,default:''},
    slug : {type:String,default:''},
    posts : Array,
    createdAt: {type:String,default:'?'},
    updatedAt: {type:String,default:'?'},
});
export const PostCategory = mongoose.model('PostCategory', UserSchema);
PostCategory.Helpers = {
    public: (doc) =>
    {
        return doc;
    },
    fields: () =>
    {
        var fields = Object.keys(UserSchema.paths);
        var results = [];
        for (var i = 0; i < fields.length; i++)
        {
            var settings = UserSchema.paths[fields[i]];
            results.push({
                name: fields[i],
                type: settings.instance,
                defaultValue: settings.defaultValue,
                multiline: fields[i] == 'ss' ? true : undefined, //adding custom field options example! (recommended : multiline , readOnly )
            });
        }
        return results;
    },
}
