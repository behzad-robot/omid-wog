const fs = require('fs');
const path = require('path');

export const API_TOKEN = "ftsb";
export const API_ENCODE_KEY = "omidwog";
export const API_URL = "http://localhost:8585/api/";
export const API_BASE_URL = "http://localhost:8585/";
export const ADMIN_FILE_UPLOAD = IS_LOCALHOST () ? "http://localhost:6565/admin/file-upload" : "http://31.184.135.51:6565/admin/file-upload";
export const ADMIN_TOKEN = "hamunhamishegi";
export const ADMIN_URL = "http://localhost:6565/";



export function IS_LOCALHOST()
{
    return fs.existsSync(path.resolve('.localhost'));

}
export function GetMongoDBURL()
{
    // return IS_LOCALHOST() ? 'mongodb://localhost:27017/wog' : 'mongodb://31.184.135.51:27017/wog';
    return 'mongodb://31.184.135.51:27017/wog';
    // return 'mongodb://localhost:27017/battleship';
    //'mongodb://admin:polo1374@localhost:27017/corridor';
}