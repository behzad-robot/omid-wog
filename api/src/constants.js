
export const API_TOKEN = "ftsb";
export const API_ENCODE_KEY = "omidwog";
export const API_URL = "http://localhost:8585/api/";
export const API_FILE_UPLOAD = "http://localhost:8585/api/file-upload";
export const ADMIN_TOKEN = "hamunhamishegi";
export const ADMIN_URL = "http://localhost:6565/";
var fs = require('fs');
var path = require('path');

export function IS_LOCALHOST()
{
    return fs.existsSync(path.resolve('.localhost'));
}
export function GetMongoDBURL()
{
    return IS_LOCALHOST() ? 'mongodb://localhost:27017/wog' : 'mongodb://determination.ir:27017/wog';
    // return 'mongodb://localhost:27017/battleship';
    //'mongodb://admin:polo1374@localhost:27017/corridor';
}