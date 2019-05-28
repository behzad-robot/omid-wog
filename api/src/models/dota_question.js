import mongoose from 'mongoose';
import { isEmptyString, getResizedFileName } from '../utils/utils';
import { SITE_URL , ICON_404 } from '../constants';
export const DotaQuestionSchema = new mongoose.Schema({
    _draft : {type : Boolean , default : true},
    level : {type : Number , default : 0},
    question : {type : String , default : ''},
    answer : {type: Number , default : -1},
    options : {type : Array , default : []}, // {index : int , body : string}
    createdAt: String,
    updatedAt: String,
    _draft: Boolean,
}, {
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true,
        }
});
export const DotaQuestion = mongoose.model('DotaQuestion', DotaQuestionSchema);
DotaQuestion.Helpers = {
    hasDraft: () => true,
    public: (doc) =>
    {
        doc = doc.toObject();
        return doc;
    },
}