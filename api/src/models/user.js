import mongoose from 'mongoose';
import { JesEncoder } from '../utils/jes-encoder';
import { API_ENCODE_KEY } from '../constants';
const encoder = new JesEncoder(API_ENCODE_KEY);
export const UserSchema = new mongoose.Schema({
    token: {type:String,default:''},
    username: {type:String,default:''},
    password: {type:String,default:''},
    profileImage :{type:String,default:''},
    cover :{type:String,default:''},
    email: {type:String,default:''},
    aboutMe : {type:String,default:''},
    phoneNumber: {type:String,default:''},
    firstName : {type:String,default:''},
    lastName : {type:String,default:''},
    sex : {type:String,default:''},
    city : {type:String,default:''},
    age : {type:Number,default:-1},


    followingGames : Array,

    createdAt: {type:String,default:'?'},
    updatedAt: {type:String,default:'?'},
    lastLogin: {type:String,default:'?'},
});
export const User = mongoose.model('User', UserSchema);
User.Helpers = {
    public: (doc) =>
    {
        delete (doc.token);
        delete (doc.password);
        delete (doc.email);
        delete( doc.phoneNumber);
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
    isValidToken: (token, callBack) =>
    {
        console.log('isValidToken=>' + token);
        User.findOne({ token: token }).exec((err, user) =>
        {
            if (err || user == null)
            {
                callBack({
                    valid: false,
                    error: err ? err : "Invalid Token!",
                    user: null,
                });
                return;
            }
            console.log(token);
            var decoded = encoder.decode(token);
            console.log(decoded);
            if (Date.now() > decoded.payload.expiresIn)
            {
                callBack({
                    valid: false,
                    error: 'Token Expired!',
                    user: null,
                });
                return;
            }
            callBack({
                valid: true,
                token: decoded,
                error: null,
                user: user,
            });
        });
    },
}
