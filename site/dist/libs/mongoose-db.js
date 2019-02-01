"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _log = require("./log");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MongooseDB = function MongooseDB(mongoUrl) {
    _classCallCheck(this, MongooseDB);

    _mongoose2.default.connect(mongoUrl);
    _mongoose2.default.set('useNewUrlParser', true);
    _mongoose2.default.set('useFindAndModify', false);
    _mongoose2.default.set('useCreateIndex', true);

    var db = _mongoose2.default.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        // we're connected!
        _log.log.success(':)) connected to mongodb');
    });
    this.mongoose = _mongoose2.default;
    this.schemas = {
        //attach your schema(s) in index.js(they can have seprate files)
    };
    //const Cat = mongoose.model('Cat', { name: String });
};

exports.default = MongooseDB;