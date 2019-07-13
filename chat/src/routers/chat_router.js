import { SocketRouter } from "./socket_router";
import { isEmptyString, moment_now } from "../utils/utils";
const ObjectId = require('mongoose').Types.ObjectId;

export class ChatSocketRouter extends SocketRouter
{
    constructor(chatModules, settings = { chatTokenRequired: true })
    {
        super(settings);
        this.chatModules = chatModules;
        this.onMessage = this.onMessage.bind(this);
        this.doLogin = this.doLogin.bind(this);
        this.removeUser = this.removeUser.bind(this);
        this.lastSocket = undefined;
        this.onlineUsers = 0;
    }
    removeUser()
    {
        if (this.lastSocket == undefined)
            return;
        this.onlineUsers--;
        this.lastSocket.sendToRoom('chat', JSON.stringify({
            code: 200,
            error: null,
            request: {
                method: 'online-users',
                model: 'chat',
            },
            _data: {
                onlineUsers: this.onlineUsers
            }
        }));
    }
    onMessage(socket, request)
    {
        // console.log('got request');
        let fail = (err, code = 500) =>
        {
            console.log(err);
            this.handleError(socket, request, err, code);
        }
        if (!this.isValidRequest(request))
        {
            console.log('invalid request');
            this.handleError(socket, request, "invalid request access denied", 400);
            return;
        }
        this.lastSocket = socket;
        if (request.method == 'join-chat')
        {
            this.onlineUsers++;
            socket.joinRoom('chat');
            socket.sendToRoom('chat', JSON.stringify({
                code: 200,
                error: null,
                request: {
                    method: 'online-users',
                    model: 'chat',
                },
                _data: {
                    onlineUsers: this.onlineUsers
                }
            }));
        }
        else if (request.method == 'join')
        {
            // console.log('valid requerst');
            if (isEmptyString(request.parameters.groupId) || isEmptyString(request.parameters.userId) ||
                isEmptyString(request.parameters.userToken))
            {
                fail('parameters missing');
                return;
            }
            this.doLogin(request.parameters).then((user) =>
            {
                this.chatModules.ChatGroup.getOne(request.parameters.groupId).then((group) =>
                {
                    if (group == undefined)
                    {
                        fail('group not found');
                        return;
                    }
                    this.chatModules.ChatArchive.find({ groupId: request.parameters.groupId }).then((as) =>
                    {
                        let archive = as[0];
                        if (archive == undefined)
                        {
                            fail('archive not found');
                            return;
                        }
                        let requiredUsersIds = [];
                        for (var i = 0; i < archive.messages.length; i++)
                        {
                            let hasUser = false;
                            for (var j = 0; j < requiredUsersIds.length; j++)
                            {
                                if (requiredUsersIds[j] == archive.messages[i].userId)
                                {
                                    hasUser = true;
                                    break;
                                }
                            }
                            if (!hasUser)
                                requiredUsersIds.push(archive.messages[i].userId);
                        }
                        this.chatModules.User.find({ _ids: requiredUsersIds }).then((users) =>
                        {
                            for (var i = 0; i < archive.messages.length; i++)
                            {
                                for (var j = 0; j < users.length; j++)
                                {
                                    if (archive.messages[i].userId == users[j]._id)
                                    {
                                        archive.messages[i]._user = users[j];
                                        break;
                                    }
                                }
                                if (archive.messages[i]._user == undefined)
                                {
                                    archive.messages[i]._user = {
                                        _id: "?",
                                        username: "??",
                                        profileImage: "??",
                                    };
                                }
                            }
                            socket.joinRoom(archive.groupId);
                            this.sendResponse(socket, request, {
                                group: group,
                                archive: archive,
                            });
                        }).catch(fail);
                    });
                });
            }).catch(fail);
        }
        else if (request.method == 'send-msg')
        {
            if (isEmptyString(request.parameters.groupId) || isEmptyString(request.parameters.userId) ||
                isEmptyString(request.parameters.userToken) || isEmptyString(request.parameters.body))
            {
                fail('parameters missing');
                return;
            }
            this.doLogin(request.parameters).then((user) =>
            {
                this.chatModules.ChatArchive.find({ groupId: request.parameters.groupId }).then((ass) =>
                {
                    if (ass == undefined && ass.length == 0)
                    {
                        fail('group not found');
                        return;
                    }
                    let archive = ass[0];
                    let message = {
                        _id: new ObjectId(),
                        userId: request.parameters.userId,
                        groupId: request.parameters.groupId,
                        body: request.parameters.body,
                        createdAt: moment_now(),
                    };
                    archive.messages.push(message);
                    this.chatModules.ChatArchive.edit(archive._id, { messages: archive.messages }).then((archive) =>
                    {
                        message._user = user;
                        socket.sendToRoom(archive.groupId, JSON.stringify({
                            code: 200,
                            error: null,
                            request: request,
                            _data: {
                                message: message
                            }
                        }));
                        // this.sendResponse(socket, request, { message: message });
                    }).catch(fail);
                });
            }).catch(fail);
        }
        else if (request.method == 'delete-msg')
        {
            if (isEmptyString(request.parameters.groupId) || isEmptyString(request.parameters.userId) ||
                isEmptyString(request.parameters.userToken) || isEmptyString(request.parameters.messageId))
            {
                fail('parameters missing');
                return;
            }
            this.doLogin(request.parameters).then((user) =>
            {
                this.chatModules.ChatArchive.find({ groupId: request.parameters.groupId }).then((ass) =>
                {
                    if (ass == undefined && ass.length == 0)
                    {
                        fail('group not found');
                        return;
                    }
                    let archive = ass[0];
                    let message = undefined, msgIndex = -1;
                    for (var i = 0; i < archive.messages.length; i++)
                    {
                        if (archive.messages[i]._id == request.parameters.messageId)
                        {
                            msgIndex = i;
                            message = archive.messages[i];
                            break;
                        }
                    }
                    if (message == undefined)
                    {
                        fail('message not found');
                        return;
                    }
                    if (message.userId != user._id)
                    {
                        fail('access denied not your message');
                        return;
                    }
                    archive.messages.splice(msgIndex, 1);
                    this.chatModules.ChatArchive.edit(archive._id, { messages: archive.messages }).then((archive) =>
                    {
                        console.log('sendToRoom');
                        socket.sendToRoom(archive.groupId, JSON.stringify({
                            code: 200,
                            error: null,
                            request: request,
                            _data: {
                                message: message
                            }
                        }));
                    }).catch(fail);
                });
            }).catch(fail);
        }
        else
            this.handleError(socket, request, 'method not found', 404);
    }
    doLogin(parameters)
    {
        return new Promise((resolve, reject) =>
        {
            this.chatModules.User.getOne(parameters.userId).then((user) =>
            {
                if (user == undefined)
                {
                    reject('user not found');
                    return;
                }
                if (parameters.userToken != user.token)
                {
                    reject('invalid token');
                    return;
                }
                resolve(user);
            });
        });
    }
}
