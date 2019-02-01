"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.JesEncoder = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _encode = require("../libs/encode");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JesEncoder = exports.JesEncoder = function () {
    function JesEncoder(key) {
        _classCallCheck(this, JesEncoder);

        //members:
        this.key = key;
        //bind functions:
        this.encode = this.encode.bind(this);
        this.decode = this.decode.bind(this);
    }

    _createClass(JesEncoder, [{
        key: "encode",
        value: function encode(payload) {
            var header = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            header.alg = "jes";
            header.typ = "JWT";
            var jwtStr = (0, _encode.encodeJWT)(header, payload, this.key);
            var encodedStr = "";
            for (var i = 0; i < jwtStr.length; i++) {
                // if (jwtStr.charAt(i) == "z")
                //     encodedStr += "a";
                // else if (jwtStr.charAt(i) == "Z")
                //     encodedStr += "A";
                // else if (jwtStr.charAt(i) == "9")
                //     encodedStr += "0";
                // else
                encodedStr += String.fromCharCode(jwtStr.charCodeAt(i) + 1);
            }
            return encodedStr;
        }
    }, {
        key: "decode",
        value: function decode(str) {
            var decodedStr = "";
            for (var i = 0; i < str.length; i++) {
                if (str.charAt(i) == "a") decodedStr += "z";else if (str.charAt(i) == "A") decodedStr += "Z";else if (str.charAt(i) == "0") decodedStr += "9";else decodedStr += String.fromCharCode(str.charCodeAt(i) - 1);
            }
            var res = (0, _encode.decodeJWT)(decodedStr);
            res.valid = res.key == this.key;
            return res;
        }
    }]);

    return JesEncoder;
}();