'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var base64Encode = exports.base64Encode = function base64Encode(str) {
    return Buffer.from(str).toString('base64');
};
var base64Decode = exports.base64Decode = function base64Decode(str) {
    return Buffer.from(str, 'base64').toString('utf8');
};
var encodeJWT = exports.encodeJWT = function encodeJWT(header, payload, key) {
    var encodedKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    return base64Encode(JSON.stringify(header)) + "." + base64Encode(JSON.stringify(payload)) + "." + (encodedKey ? base64Encode(key) : key);
};
var decodeJWT = exports.decodeJWT = function decodeJWT(str) {
    var encodedKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var parts = str.split('.');
    return {
        header: JSON.parse(base64Decode(parts[0])),
        payload: JSON.parse(base64Decode(parts[1])),
        key: encodedKey ? base64Decode(parts[2]) : parts[2]
    };
};