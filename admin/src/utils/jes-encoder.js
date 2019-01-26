import { encodeJWT, decodeJWT } from "../libs/encode";

export class JesEncoder
{
    constructor(key)
    {
        //members:
        this.key = key;
        //bind functions:
        this.encode = this.encode.bind(this);
        this.decode = this.decode.bind(this);
    }
    encode(payload, header = {})
    {
        header.alg = "jes";
        header.typ = "JWT";
        var jwtStr = encodeJWT(header, payload, this.key);
        var encodedStr = "";
        for (var i = 0; i < jwtStr.length; i++)
        {
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
    decode(str)
    {
        var decodedStr = "";
        for (var i = 0; i < str.length; i++)
        {
            if (str.charAt(i) == "a")
                decodedStr += "z";
            else if (str.charAt(i) == "A")
                decodedStr += "Z";
            else if (str.charAt(i) == "0")
                decodedStr += "9";
            else
                decodedStr += String.fromCharCode(str.charCodeAt(i) - 1);
        }
        var res = decodeJWT(decodedStr);
        res.valid = res.key == this.key;
        return res;
    }
}