import mongoose from 'mongoose';
export const PubGTeamSchema = new mongoose.Schema({
    teamName: String,
    createdAt: String,
    updatedAt: String,
    payment: { type: Object, default: { status: 0, description: '', payedAt: '', refID: '' } },
    members: Array, // {isLeader : boolean , firstName , lastName , username , phoneNumber }

}, {
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true,
        }
    });
export const PubGTeam = mongoose.model('pubgteam', PubGTeamSchema);
PubGTeam.Helpers = {
    hasDraft: () => false,
    public: (doc) =>
    {
        doc = doc.toObject();
        return doc;
    },
}