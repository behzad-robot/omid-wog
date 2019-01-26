import mongoose from 'mongoose';


export const AnalyticsEventSchema = new mongoose.Schema({
    eventName: String,
    eventType: String, // http , ws , etc,
    events: Array, /*input: Object, output: Object,code: Number, createdAt : String*/
    createdAt: String,
});
export const AnalyticsEvent = mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
AnalyticsEvent.Helpers = {
    newEvent: (eventName, eventType, category, input = {}, output = {}, code = 200) =>
    {
        return new Promise((resolve, reject) =>
        {
            var d = new Date(Date.now());
            var event = {
                input: input,
                output: output,
                code: code,
                createdAt: d.toISOString(),
            };
            AnalyticsEvent.findOne({ eventName: eventName }).exec((err, result) =>
            {
                if (result == null)
                {
                    var a = new AnalyticsEvent({
                        eventName: eventName,
                        eventType: eventType,
                        category: category,
                        createdAt: d.toISOString(),
                        events: [event]
                    });
                    a.save().then(() =>
                    {
                        console.log(`created analytics event! ${eventName}`);
                        resolve();
                    });
                    return;
                }
                result.events.push(event);
                AnalyticsEvent.updateOne({ _id: result._id }, { $set: { events: result.events } }, (err, raw) =>
                {
                    console.log(`pushed analytics event! ${eventName}`);
                    resolve();
                });
            });
        });
    },
    newHttpEvent: (eventName, category = "http-default", input = {}, output = {}, code = 200) =>
    {
        return AnalyticsEvent.Helpers.newEvent(eventName, category, "http", input, output, code);
    },
    newWSEvent: (eventName, category = "ws-default", input = {}, output = {}, code = 200) =>
    {
        return AnalyticsEvent.Helpers.newEvent(eventName, category, "http", input, output, code);
    },
    public: (doc) =>
    {
        return doc;
    },
    fields: () =>
    {
        var fields = Object.keys(AnalyticsEventSchema.paths);
        var results = [];
        for (var i = 0; i < fields.length; i++)
        {
            var settings = AnalyticsEventSchema.paths[fields[i]];
            results.push({
                name: fields[i],
                type: settings.instance,
                defaultValue: settings.defaultValue,
                multiline: fields[i] == 'ss' ? true : undefined, //adding custom field options example! (recommended : multiline , readOnly )
            });
        }
        return results;
    }

}