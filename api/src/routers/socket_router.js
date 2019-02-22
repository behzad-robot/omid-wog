import { JesEncoder } from "../utils/jes-encoder";
import { API_ENCODE_KEY } from "../constants";

const encoder = new JesEncoder(API_ENCODE_KEY);
export class SocketRouter
{
    constructor(settings = { apiTokenRequired: false })
    {
        this.settings = settings;
        //bind functions:
        this.handleError = this.handleError.bind(this);
        this.sendResponse = this.sendResponse.bind(this);
        this.isValidRequest = this.isValidRequest.bind(this);
        this.onMessage = this.onMessage.bind(this);

    }
    onMessage(socket, request)
    {
        console.log("onMessage not implemented!");
    }
    handleError(socket, request, error, code = 500)
    {
        if (typeof error != 'string')
        {
            code = error.code ? error.code : code;
            error = error.error ? error.error : error.toString();
        }
        socket.send({ code: code, error: error, _data: null, request: request });
    }
    sendResponse(socket, request, data, code = 200)
    {
        if(request.model == 'users')
            console.log({ code: code, error: null, _data: data, request: request });
        if (socket.isAdmin)
            socket.send({ code: code, error: null, _data: data, request: request });
        else
            socket.send({ code: code, error: null, _data: encoder.encode(data), request: request });
    }
    isValidRequest(request)
    {
        if (!this.settings.apiTokenRequired)
            return true;
        if (request._headers == undefined || request._headers['api-token'] != API_TOKEN)
            return false;
        else
            return true;
    }
}