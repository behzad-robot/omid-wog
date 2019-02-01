'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EasySocket = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _log = require('./log');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WebSocketServer = require('websocket').server;

var EasySocket = exports.EasySocket = function () {
    function EasySocket() {
        var _this = this;

        var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
            httpServer: undefined,
            originIsAllowed: function originIsAllowed(origin) {
                return true;
            },
            onMessage: function onMessage(connection, messageStr) {},
            onSocketConnected: function onSocketConnected(connection) {},
            onSocketDisconnected: function onSocketDisconnected(connection, reasonCode, description) {}
        };

        _classCallCheck(this, EasySocket);

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
        var wsServer = new WebSocketServer({
            httpServer: settings.httpServer,
            // You should not use autoAcceptConnections for production
            // applications, as it defeats all standard cross-origin protection
            // facilities built into the protocol and the browser.  You should
            // *always* verify the connection's origin and decide whether or not
            // to accept it.
            autoAcceptConnections: false
        });
        wsServer.on('request', function (request) {
            if (!settings.originIsAllowed(request.origin)) {
                request.reject();
                _log.log.error('Connection from origin ' + request.origin + ' rejected.');
                return;
            }
            //accept and setup socket:
            var connection = request.accept();
            connection.socketId = _this.clientID++;
            connection.oldSend = connection.send;
            connection.send = function (str) {
                if (typeof str != 'string') str = JSON.stringify(str);
                connection.sendUTF(str);
            };
            connection.joinRoom = function (roomName) {
                _this.joinRoom(connection, roomName);
            };
            connection.leaveRoom = function (roomName) {
                _this.leaveRoom(connection, roomName);
            };
            connection.sendToRoom = function (roomName, str) {
                _this.sendToRoom(roomName, str);
            };
            connection.getSocket = function (socketId) {
                return _this.getClient(socketId);
            };
            _this.addClient(connection);
            _this.cleanRooms();
            settings.onSocketConnected(connection);
            _log.log.print(' Connection accepted => ' + connection.socket.remoteAddress + ' : ' + connection.socket.remotePort);
            //onMessage:
            connection.on('message', function (message) {
                if (message.type === 'utf8') {
                    var str = message.utf8Data;
                    if (str == "ping") {
                        setTimeout(function () {
                            connection.send("pong");
                        }, 100);
                    } else if (str == "handshake") {
                        connection.send("handshake-answer");
                    } else {
                        //console.log('Received Message: ' + str);
                        settings.onMessage(connection, str);
                    }
                } else if (message.type === 'binary') {
                    console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
                    //connection.sendBytes(message.binaryData);
                }
            });
            connection.on('close', function (reasonCode, description) {
                _log.log.print(' Peer ' + connection.remoteAddress + ' disconnected.');
                _this.removeClient(connection);
                settings.onSocketDisconnected(connection, reasonCode, description);
            });
        });
    }

    //client functions:


    _createClass(EasySocket, [{
        key: 'addClient',
        value: function addClient(connection) {
            this.clients.push(connection);
        }
    }, {
        key: 'getClient',
        value: function getClient(socketId) {
            for (var i = 0; i < this.clients.length; i++) {
                if (this.clients[i].socketId == socketId) return this.clients[i];
            }return undefined;
        }
    }, {
        key: 'removeClient',
        value: function removeClient(connection) {
            for (var i = 0; i < this.clients.length; i++) {
                if (this.clients[i].socketId == connection.socketId) {
                    this.clients.splice(i, 1);
                    break;
                }
            }
        }
        // room functions:

    }, {
        key: 'sendToRoom',
        value: function sendToRoom(roomName, str) {
            var room = this.getRoom(roomName);
            for (var i = 0; i < room.clients.length; i++) {
                var client = this.getClient(room.clients[i]);
                if (client != undefined) client.send(str);
            }
        }
    }, {
        key: 'getRoom',
        value: function getRoom(roomName) {
            for (var i = 0; i < this.rooms.length; i++) {
                if (this.rooms[i].name == roomName) return this.rooms[i];
            }this.rooms.push({
                name: roomName,
                clients: []
            });
            return this.rooms[this.rooms.length - 1];
        }
    }, {
        key: 'joinRoom',
        value: function joinRoom(client, roomName) {
            var room = this.getRoom(roomName);
            //check for already in room:
            for (var i = 0; i < room.clients.length; i++) {
                if (room.clients[i] == client.socketId) return;
            }
            //join:
            room.clients.push(client.socketId);
        }
    }, {
        key: 'leaveRoom',
        value: function leaveRoom(client, roomName) {
            var room = this.getRoom(roomName);
            for (var i = 0; i < room.clients.length; i++) {
                if (room.clients[i] == client.socketId) {
                    room.clients.splice(i, 1);
                    break;
                }
            }
        }
    }, {
        key: 'cleanRooms',
        value: function cleanRooms() {
            for (var i = 0; i < this.rooms.length; i++) {
                if (this.rooms[i].clients == 0) {
                    this.rooms.splice(i, 1);
                    i = 0;
                } else {
                    //check for dc clients:
                    for (var j = 0; j < this.rooms[i].clients.length; j++) {
                        var c = this.getClient(this.rooms[i].clients[j]);
                        if (c == undefined) {
                            this.rooms[i].clients.splice(j, 1);
                            j = 0;
                        }
                    }
                }
            }
            console.log('CLEAN ROOMS=>' + JSON.stringify(this.rooms));
        }
    }]);

    return EasySocket;
}();