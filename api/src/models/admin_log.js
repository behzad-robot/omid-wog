import mongoose from 'mongoose';
export const AdminLogSchema = new mongoose.Schema({
    objectId: String,
    objectType: String,
    userId: String,
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    url: { type: String, default: '' },
    postBody: {type: Object , default : {} },
    

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
export const AdminLog = mongoose.model('AdminLog', AdminLogSchema);
AdminLog.Helpers = {
    hasDraft: () => false,
    public: (doc) =>
    {
        doc = doc.toObject();
        return doc;
    },
}