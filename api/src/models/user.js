import mongoose from 'mongoose';
import { JesEncoder } from '../utils/jes-encoder';
import { API_ENCODE_KEY } from '../constants';
const encoder = new JesEncoder(API_ENCODE_KEY);
export const UserSchema = new mongoose.Schema({
    token: String,
    username: String,
    password: String,
    email: String,
    phoneNumber: String,
    firstName : String,
    lastName : String,
    sex : String,

    followingGames : Array,

    createdAt: String,
    updatedAt: String,
    lastLogin: String,
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
        //console.log('isValidToken=>' + token);
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
            var decoded = encoder.decode(token);
            //console.log(decoded);
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
