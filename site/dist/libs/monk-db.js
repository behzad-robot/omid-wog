'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MonkDatabase = exports.MonkDatabase = function () {
    function MonkDatabase(mongoUrl) {
        _classCallCheck(this, MonkDatabase);

        //exports:
        this.db = require('monk')(mongoUrl);
        //function binding:
        this.getCollection = this.getCollection.bind(this);
    }

    _createClass(MonkDatabase, [{
        key: 'getCollection',
        value: function getCollection(name) {
            var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

            if (settings == undefined) return new Collection(this.db.get(name));else return new Collection(this.db.get(name), settings);
        }
    }]);

    return MonkDatabase;
}();

var Collection = exports.Collection = function () {
    function Collection(collection) {
        var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
            privateFields: []
        };

        _classCallCheck(this, Collection);

        //exports:
        this.collection = collection;
        this.name = this.collection.name;
        this.settings = settings;
        //function binding:
        this.getOne = this.getOne.bind(this);
        this.find = this.find.bind(this);
    }

    _createClass(Collection, [{
        key: 'getOne',
        value: function getOne(_id) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                _this.collection.findOne({ _id: _id }).then(function (doc) {
                    if (_this.settings != undefined && _this.settings.privateFields != undefined && _this.settings.privateFields.length != 0) {
                        for (var i = 0; i < _this.settings.privateFields.length; i++) {
                            delete doc[_this.settings.privateFields[i]];
                        }resolve(doc);
                    } else resolve(doc);
                }).catch(reject);
            });
        }
    }, {
        key: 'find',
        value: function find(condition) {
            var _this2 = this;

            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return new Promise(function (resolve, reject) {
                _this2.collection.find(condition, options).then(function (docs) {
                    if (_this2.settings != undefined && _this2.settings.privateFields != undefined && _this2.settings.privateFields.length != 0) {
                        for (var j = 0; j < docs.length; j++) {
                            for (var i = 0; i < _this2.settings.privateFields.length; i++) {
                                delete docs[j][_this2.settings.privateFields[i]];
                            }
                        }
                        resolve(docs);
                    } else resolve(docs);
                }).catch(reject);
            });
        }
    }, {
        key: 'insert',
        value: function insert(data) {
            return this.collection.insert(data);
        }
    }, {
        key: 'editOne',
        value: function editOne(_id, data) {
            return this.collection.update({ _id: _id }, data);
        }
    }, {
        key: 'deleteOne',
        value: function deleteOne(_id) {
            return this.collection.remove({ _id: _id });
        }
    }]);

    return Collection;
}();