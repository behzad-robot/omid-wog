'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.IS_LOCALHOST = IS_LOCALHOST;
exports.GetMongoDBURL = GetMongoDBURL;
var fs = require('fs');
var path = require('path');

var API_TOKEN = exports.API_TOKEN = "ftsb";
var API_ENCODE_KEY = exports.API_ENCODE_KEY = "omidwog";
var API_URL = exports.API_URL = "http://localhost:8585/api/";
var API_BASE_URL = exports.API_BASE_URL = "http://localhost:8585/";
var ADMIN_FILE_UPLOAD = exports.ADMIN_FILE_UPLOAD = IS_LOCALHOST() ? "http://localhost:6565/admin/file-upload" : "http://31.184.135.51:6565/admin/file-upload";
var ADMIN_TOKEN = exports.ADMIN_TOKEN = "hamunhamishegi";
var ADMIN_URL = exports.ADMIN_URL = "http://localhost:6565/";

function IS_LOCALHOST() {
    return fs.existsSync(path.resolve('.localhost'));
}
function GetMongoDBURL() {
    // return IS_LOCALHOST() ? 'mongodb://localhost:27017/wog' : 'mongodb://31.184.135.51:27017/wog';
    return 'mongodb://31.184.135.51:27017/wog';
    // return 'mongodb://localhost:27017/battleship';
    //'mongodb://admin:polo1374@localhost:27017/corridor';
}