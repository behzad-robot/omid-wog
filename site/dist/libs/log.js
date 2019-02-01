'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var FILE_LOG = true;

var colors = require('colors');
var fs = require('fs');
var path = require('path');

//module:
var log = exports.log = {
    print: function print(str) {
        console.log(str);
        appendToFile(str);
    },
    success: function success(message) {
        console.log(colors.green(message));
        appendToFile(message, '#4CAF50');
    },
    error: function error(message) {
        console.log(colors.red(message));
        appendToFile(message, '#f44336');
    },
    warning: function warning(message) {
        console.log(colors.rainbow(message));
        appendToFile(message, '#FFC107');
    }
};
var appendToFile = function appendToFile(str) {
    var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'black';

    if (!FILE_LOG) return;
    if ((typeof str === 'undefined' ? 'undefined' : _typeof(str)) == 'object' || typeof str == 'array') str = JSON.stringify(str);
    // const FILE = path.resolve('log.html');
    // const data = `<div><span style="color:${color};">${str}</span><br><small>createdAt : ${new Date(Date.now()).toLocaleString()}</small><hr/></div>\n`;
    // fs.appendFile(FILE,data,(err)=>{

    // });
};