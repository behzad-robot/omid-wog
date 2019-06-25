import { SocketRouter } from "./socket_router";

export class ChatSocketRouter extends SocketRouter
{
    constructor(chatModules, settings = { chatTokenRequired: true })
    {
        super(settings);
        this.chatModules = chatModules;
        this.onMessage = this.onMessage.bind(this);
    }
    onMessage(socket, request)
    {
        console.log('got request');
        if (!this.isValidRequest(request))
        {
            console.log('invalid request');
            this.handleError(socket, request, "invalid request access denied", 400);
            return;
        }
        if (request.method == 'join')
        {
            console.log('valid requerst');
            this.sendResponse(socket, request, { ok: true });
        }
        else
            this.handleError(socket, request, 'method not found', 404);
    }
}