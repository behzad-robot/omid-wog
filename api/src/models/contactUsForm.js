import mongoose from 'mongoose';

export const ContactUsFormSchema = new mongoose.Schema({
    name: String,
    email : String,
    subject : String,
    body:  String,
});
export const ContactUsForm = mongoose.model('ContactUsForm', ContactUsFormSchema);
ContactUsForm.Helpers = {
    public: (doc) =>
    {
        return doc;
    },
}