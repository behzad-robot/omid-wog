import { log } from "./log";
var WebSocketServer = require('websocket').server;
export class EasySocket
{
    constructor(settings = {
        httpServer: undefined,
        originIsAllowed: (origin) => { return true; },
        onMessage: (connection, messageStr) => { },
        onSocketConnected: (connection) => { },
        onSocketDisconnected: (connection, reasonCode, description) => { },
    })
    {
        //bind functions:
        this.addClient = this.addClient.bind(this);
        this.getClient = this.getClient.bind(this);
        this.removeClient = this.removeClient.bind(this);

        this.getRoom = this.getRoom.bind(this);
        this.joinRoom = this.joinRoom.bind(this);
        this.leaveRoom = this.leaveRoom.bind(this);
        this.sendToRoom = this.sendToRoom.bind(this);
        this.cleanRooms = this.cleanRooms.bind(this);


        //websocket variables:
        this.clients = [];
        this.rooms = [];
        this.clientID = 0;
        const wsServer = new WebSocketServer({
            httpServer: settings.httpServer,
            // You should not use autoAcceptConnections for production
            // applications, as it defeats all standard cross-origin protection
            // facilities built into the protocol and the browser.  You should
            // *always* verify the connection's origin and decide whether or not
            // to accept it.
            autoAcceptConnections: false
        });
        wsServer.on('request', (request) =>
        {
            if (!settings.originIsAllowed(request.origin))
            {
                request.reject();
                log.error('Connection from origin ' + request.origin + ' rejected.');
                return;
            }
            //accept and setup socket:
            var connection = request.accept();
            connection.socketId = this.clientID++;
            connection.oldSend = connection.send;
            connection.send = (str) =>
            {
                if (typeof str != 'string')
                    str = JSON.stringify(str);
                connection.sendUTF(str);
            };
            connection.joinRoom = (roomName) =>
            {
                this.joinRoom(connection, roomName);
            }
            connection.leaveRoom = (roomName) =>
            {
                this.leaveRoom(connection, roomName);
            }
            connection.sendToRoom = (roomName, str) =>
            {
                this.sendToRoom(roomName, str);
            };
            connection.getSocket = (socketId) =>
            {
                return this.getClient(socketId);
            };
            this.addClient(connection);
            this.cleanRooms();
            settings.onSocketConnected(connection);
            log.print(' Connection accepted => ' + connection.socket.remoteAddress + ' : ' + connection.socket.remotePort);
            //onMessage:
            connection.on('message', function (message)
            {
                if (message.type === 'utf8')
                {
                    var str = message.utf8Data;
                    if (str == "ping")
                    {
                        setTimeout(() => { connection.send("pong"); }, 100);
                    }
                    else if (str == "handshake")
                    {
                        connection.send("handshake-answer");
                    }
                    else
                    {
                        //console.log('Received Message: ' + str);
                        settings.onMessage(connection, str);
                    }
                }
                else if (message.type === 'binary')
                {
                    console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
                    //connection.sendBytes(message.binaryData);
                }
            });
            connection.on('close', (reasonCode, description) =>
            {
                log.print(' Peer ' + connection.remoteAddress + ' disconnected.');
                this.removeClient(connection);
                settings.onSocketDisconnected(connection, reasonCode, description);
            });
        });
    }



    //client functions:
    addClient(connection)
    {
        this.clients.push(connection);
    }
    getClient(socketId)
    {
        for (var i = 0; i < this.clients.length; i++)
            if (this.clients[i].socketId == socketId)
                return this.clients[i];
        return undefined;
    }
    removeClient(connection)
    {
        for (var i = 0; i < this.clients.length; i++)
        {
            if (this.clients[i].socketId == connection.socketId)
            {
                this.clients.splice(i, 1);
                break;
            }
        }
    }
    // room functions:
    sendToRoom(roomName, str)
    {
        var room = this.getRoom(roomName);
        for (var i = 0; i < room.clients.length; i++)
        {
            var client = this.getClient(room.clients[i]);
            if (client != undefined)
                client.send(str);
        }
    }
    getRoom(roomName)
    {
        for (var i = 0; i < this.rooms.length; i++)
            if (this.rooms[i].name == roomName)
                return this.rooms[i];
        this.rooms.push({
            name: roomName,
            clients: [],
        });
        return this.rooms[this.rooms.length - 1];
    }
    joinRoom(client, roomName)
    {
        var room = this.getRoom(roomName);
        //check for already in room:
        for (var i = 0; i < room.clients.length; i++)
        {
            if (room.clients[i] == client.socketId)
                return;
        }
        //join:
        room.clients.push(client.socketId);
    }
    leaveRoom(client, roomName)
    {
        var room = this.getRoom(roomName);
        for (var i = 0; i < room.clients.length; i++)
        {
            if (room.clients[i] == client.socketId)
            {
                room.clients.splice(i, 1);
                break;
            }
        }
    }
    cleanRooms()
    {
        for (var i = 0; i < this.rooms.length; i++)
        {
            if (this.rooms[i].clients == 0)
            {
                this.rooms.splice(i, 1);
                i = 0;
            }
            else
            {
                //check for dc clients:
                for (var j = 0; j < this.rooms[i].clients.length; j++)
                {
                    var c = this.getClient(this.rooms[i].clients[j]);
                    if (c == undefined)
                    {
                        this.rooms[i].clients.splice(j, 1);
                        j = 0;
                    }
                }
            }
        }
        console.log('CLEAN ROOMS=>' + JSON.stringify(this.rooms));
    }

}