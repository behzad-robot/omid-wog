import mongoose from 'mongoose';
import { JesEncoder } from '../utils/jes-encoder';
import { API_ENCODE_KEY } from '../constants';
const encoder = new JesEncoder(API_ENCODE_KEY);
export const AdminSchema = new mongoose.Schema({
    token: String,
    username: String,
    password: String,
    email: String,

    createdAt: String,
    updatedAt: String,
    lastLogin: String,
});
export const Admin = mongoose.model('Admin', AdminSchema);
Admin.Helpers = {
    public: (doc) =>
    {
        delete (doc.token);
        delete (doc.password);
        delete (doc.email);
        return doc;
    },
    isValidToken: (token, callBack) =>
    {
        //console.log('isValidToken=>' + token);
        Admin.findOne({ token: token }).exec((err, Admin) =>
        {
            if (err || Admin == null)
            {
                callBack({
                    valid: false,
                    error: err ? err : "Invalid Token!",
                    Admin: null,
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
                    Admin: null,
                });
                return;
            }
            callBack({
                valid: true,
                token: decoded,
                error: null,
                Admin: Admin,
            });
        });
    },
}
