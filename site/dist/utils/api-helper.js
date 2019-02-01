'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.APIProxy = exports.APICollection = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         Version : 0.0.3b
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */


var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var APICollection = exports.APICollection = function () {
    function APICollection(slug) {
        var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { apiToken: "", adminToken: undefined };

        _classCallCheck(this, APICollection);

        //data:
        this.slug = slug;
        this.headers = {
            'api-token': settings.apiToken,
            'admin-token': settings.adminToken
            //bind functions:
        };this.apiCall = this.apiCall.bind(this);
        this.getOne = this.getOne.bind(this);
        this.find = this.find.bind(this);
        this.insert = this.insert.bind(this);
        this.edit = this.edit.bind(this);
        this.delete = this.delete.bind(this);
        this.fileUpload = this.fileUpload.bind(this);
    }

    _createClass(APICollection, [{
        key: 'fileUpload',
        value: function fileUpload(files) {
            var postHeaders = Object.assign({}, this.headers);
            postHeaders['Content-Type'] = 'application/json';
            var settings = {
                method: 'POST',
                headers: postHeaders
            };
            settings.body = JSON.stringify({ files: files });
            return (0, _nodeFetch2.default)(_constants.API_URL + 'file-upload', settings).then(function (res) {
                return res.text();
            });
        }
    }, {
        key: 'apiCall',
        value: function apiCall(query, method, body) {
            var postHeaders = Object.assign({}, this.headers);
            postHeaders['Content-Type'] = 'application/json';
            var settings = {
                method: method,
                headers: postHeaders
            };
            if (method == 'POST') settings.body = JSON.stringify(body);
            return (0, _nodeFetch2.default)(_constants.API_URL + this.slug + '/' + query, settings).then(function (res) {
                return res.text();
            });
        }
    }, {
        key: 'getOne',
        value: function getOne(_id) {
            return (0, _nodeFetch2.default)(_constants.API_URL + this.slug + '/' + _id + '/', {
                headers: this.headers
            }).then(function (res) {
                return res.json();
            }).then(function (obj) {
                return new Promise(function (resolve, reject) {
                    if (obj.error != undefined && obj.code != undefined) reject(obj.error);else resolve(obj);
                });
            });
        }
    }, {
        key: 'find',
        value: function find() //can be anything that api supports!
        {
            var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
            var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 50;
            var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

            var q = '?limit=' + limit + '&offset=' + offset;
            if (query != undefined) {
                var keys = Object.keys(query);
                for (var i = 0; i < keys.length; i++) {
                    q += "&" + keys[i] + "=" + query[keys[i]];
                }
            }
            console.log(q);
            return (0, _nodeFetch2.default)(_constants.API_URL + this.slug + '/' + q, {
                headers: this.headers
            }).then(function (res) {
                return res.json();
            });
        }
    }, {
        key: 'insert',
        value: function insert(doc) {
            var postHeaders = Object.assign({}, this.headers);
            postHeaders['Content-Type'] = 'application/json';
            return (0, _nodeFetch2.default)(_constants.API_URL + this.slug + '/new', {
                method: "POST",
                headers: postHeaders,
                body: JSON.stringify(doc)
            }).then(function (res) {
                return res.json();
            });
        }
    }, {
        key: 'edit',
        value: function edit(_id, doc) {
            var postHeaders = Object.assign({}, this.headers);
            postHeaders['Content-Type'] = 'application/json';
            return (0, _nodeFetch2.default)(_constants.API_URL + this.slug + '/' + _id + '/edit', {
                method: "POST",
                headers: postHeaders,
                body: JSON.stringify(doc)
            }).then(function (res) {
                return res.json();
            });
        }
    }, {
        key: 'delete',
        value: function _delete(_id) {
            return (0, _nodeFetch2.default)(_constants.API_URL + this.slug + '/' + _id + '/delete/', {
                headers: this.headers
            }).then(function (res) {
                return res.json();
            });
        }
    }]);

    return APICollection;
}();

var APIProxy = exports.APIProxy = function () {
    function APIProxy() {
        var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { apiToken: "", adminToken: undefined };

        _classCallCheck(this, APIProxy);

        //data:
        this.headers = {
            'api-token': settings.apiToken,
            'admin-token': settings.adminToken
            //bind functions:
        };this.apiCall = this.apiCall.bind(this);
    }

    _createClass(APIProxy, [{
        key: 'apiCall',
        value: function apiCall(method, url, body) {
            var postHeaders = Object.assign({}, this.headers);
            postHeaders['Content-Type'] = 'application/json';
            var settings = {
                method: method,
                headers: postHeaders
            };
            if (method == 'POST') settings.body = JSON.stringify(body);
            return (0, _nodeFetch2.default)(url, settings).then(function (res) {
                return res.text();
            });
        }
    }]);

    return APIProxy;
}();