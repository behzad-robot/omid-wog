export const base64Encode = (str) =>
{
    return Buffer.from(str).toString('base64');
};
export const base64Decode = (str) =>
{
    return Buffer.from(str, 'base64').toString('utf8');
};
export const encodeJWT = (header,payload,key,encodedKey=false)=>{
    return base64Encode(JSON.stringify(header))+"."+base64Encode(JSON.stringify(payload))+"."+(encodedKey ? base64Encode(key): key);
}
export const decodeJWT = (str,encodedKey=false)=>{
    var parts = str.split('.');
    return {
        header : JSON.parse(base64Decode(parts[0])),
        payload : JSON.parse(base64Decode(parts[1])),
        key : encodedKey ? base64Decode(parts[2]) : parts[2],
    }
}