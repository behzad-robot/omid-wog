import mongoose from 'mongoose';
export const CommentSchema = new mongoose.Schema({
    objectId : String,
    objectType : String,
    userId : String,

    body : String,

    createdAt: String,
    updatedAt: String,
    _draft : Boolean,
}, {
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true,
        }
    });

export const Comment = mongoose.model('Comment', CommentSchema);
Comment.Helpers = {
    hasDraft : () => true ,
    public: (doc) => {
        doc = doc.toObject();
        return doc;
    },
}