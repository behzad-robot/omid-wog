import mongoose from 'mongoose';

/*
    A comment can be used for any objectType meaning any other model class as long as it provides _id field(objectId)
    (Meaning that we can use comments for nested/weak entities.)
 */
export const SocialChatArchiveSchema = new mongoose.Schema({
    groupId: { type: String, default: '' },
    messages: [{
        _id: String,
        groupId: String,
        userId: String,
        body: String,
        createdAt: String,
    }],

    createdAt: String,
    updatedAt: String,
    _draft: { type: Boolean, default: true },
}, {
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true,
        }
    });
export const SocialChatArchive = mongoose.model('SocialChatArchive', SocialChatArchiveSchema);
SocialChatArchive.Helpers = {
    hasDraft: () => true,
    public: (doc) =>
    {
        doc = doc.toObject();
        return doc;
    },
}