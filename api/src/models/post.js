import mongoose from 'mongoose';

export const PostSchema = new mongoose.Schema({
    title:String,
    intro:String,
    body:String,
    slug:String,
    thumbnail:String,
    adminId:String,
    gameId:String,
    tags:Array,
    
    createdAt:String,
    updatedAt:String,
});
export const Post= mongoose.model('Post', PostSchema);
Post.Helpers = {
    public: (doc) =>
    {
        return doc;
    },
}