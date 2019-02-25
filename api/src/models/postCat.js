import mongoose from 'mongoose';
export const PostCategorySchema = new mongoose.Schema({
    name : {type:String,default:''},
    slug : {type:String,default:''},
    createdAt: {type:String,default:'?'},
    updatedAt: {type:String,default:'?'},
    _draft : Boolean,
});
export const PostCategory = mongoose.model('PostCategory', PostCategorySchema);
PostCategory.Helpers = {
    hasDraft : () => true ,
    public: (doc) =>
    {
        return doc;
    },
}
