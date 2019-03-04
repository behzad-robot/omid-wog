import mongoose from "mongoose";
import { log } from "./log";
export default class MongooseDB
{
    constructor(mongoUrl)
    {
        mongoose.connect(mongoUrl);
        mongoose.set('useNewUrlParser', true);
        mongoose.set('useFindAndModify', false);
        mongoose.set('useCreateIndex', true);

        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function ()
        {
            // we're connected!
            log.success(':)) connected to mongodb');
        });
        this.mongoose = mongoose;
        this.schemas = {
            //attach your schema(s) in index.js(they can have seprate files)
        };
        //const Cat = mongoose.model('Cat', { name: String });
    }
}

