import mongoose from 'mongoose';
export const OTPObjectSchema = new mongoose.Schema({
    type : String,
    phoneNumber : String,
    code : String,
    body : String,
    status : {type:Number,default:0}, // 0 : pending , 1 : used
    lastSent : Number,
    createdAt: { type: String, default: '?' },
    updatedAt: { type: String, default: '?' },
});
export const OTPObject = mongoose.model('OTPObject', OTPObjectSchema);
OTPObject.Helpers = {
    hasDraft: () => false,
    public: (doc) =>
    {
        return doc;
    },
};
