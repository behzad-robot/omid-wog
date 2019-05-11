import mongoose from 'mongoose';
import { JesEncoder } from '../utils/jes-encoder';
import { API_ENCODE_KEY, SITE_URL } from '../constants';
import { isEmptyString } from '../utils/utils';
const encoder = new JesEncoder(API_ENCODE_KEY);
export const UserSchema = new mongoose.Schema({
    token: { type: String, default: '' },
    resetPassToken: { type: String, default: '' },
    username: { type: String, default: '' },
    password: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    cover: { type: String, default: '' },
    email: { type: String, default: '' },
    aboutMe: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    sex: { type: String, default: '' },
    city: { type: String, default: '' },
    age: { type: Number, default: -1 },


    followingGames: Array,

    //personell only:
    isPersonel: { type: Boolean, default: false },
    personelImage: { type: String, default: '' },
    personelCategory: { type: String, default: '' },

    //games and outsource:
    epicGamesID: { type: String, default: '' },
    psnID: { type: String, default: '' },

    _draft: Boolean,
    createdAt: { type: String, default: '?' },
    updatedAt: { type: String, default: '?' },
    lastLogin: { type: String, default: '?' },
    accessLevel: { type: Object, default: { isAdmin: false, permissions: [] } },
    /**
     * permissions list:
     * super ( can do everything)
     * posts-super (can do everything with all posts)
     * posts (can add/edit posts that they own)
     * games-super (can do everything with games)
     * games-{game.token} (can do everything other than delete with certain game)
     */
    dota2Book2019: {
        type: Object,
        default: {
            enterEvent : false,
            initPayment: false,
            initPaymentToken: "",
            initPaymentDate: "",
            coins: 0,
            freeActions : 3,
            actions: [], // { token : string , reward : int , createdAt : string }
            bets: [], // { token : string , value : string ,coins : int , status : string , createdAt : string } // status : pending , win , loose
            /**
             *  if bet is win create related action 
             */
        }
    },
    fortnite2019: {
        type: Object,
        default: {
            hasJoined: false,
            joinedAt : "",
        }
    }
}, {
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true,
        }
    });
UserSchema.virtual('profileImage_url').get(function ()
{
    var profileImage = this.profileImage;
    if (isEmptyString(profileImage))
        return SITE_URL('/images/mario-gamer.jpg');
    else
        return SITE_URL(profileImage);
});
UserSchema.virtual('cover_url').get(function ()
{
    var cover = this.cover;
    if (isEmptyString(cover))
        return SITE_URL('/images/user-default-cover.jpg');
    else
        return SITE_URL(cover);
});
export const User = mongoose.model('User', UserSchema);
User.Helpers = {
    hasDraft: () => false,
    public: (doc) =>
    {
        doc = doc.toObject();
        delete (doc.accessLevel);
        delete (doc.token);
        delete (doc.password);
        delete (doc.email);
        delete (doc.phoneNumber);
        if (doc.profileImage)
            doc.profileImage = SITE_URL(doc.profileImage);
        if (doc.cover)
            doc.cover = SITE_URL(doc.cover);
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
