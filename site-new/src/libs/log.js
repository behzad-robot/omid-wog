const FILE_LOG = true;



const colors = require('colors');
const fs = require('fs');
const path = require('path');


//module:
export const log = {
    print: (str) =>
    {
        console.log(str);
        appendToFile(str);
    },
    success: (message) =>
    {
        console.log(colors.green(message));
        appendToFile(message, '#4CAF50');
    },
    error: (message) =>
    {
        console.log(colors.red(message));
        appendToFile(message, '#f44336');
    },
    warning: (message) =>
    {
        console.log(colors.rainbow(message));
        appendToFile(message, '#FFC107');
    }
}
const appendToFile = (str, color = 'black') =>
{
    if (!FILE_LOG)
        return;
    if (typeof str == 'object' || typeof str == 'array')
        str = JSON.stringify(str);
    // const FILE = path.resolve('log.html');
    // const data = `<div><span style="color:${color};">${str}</span><br><small>createdAt : ${new Date(Date.now()).toLocaleString()}</small><hr/></div>\n`;
    // fs.appendFile(FILE,data,(err)=>{

    // });
}