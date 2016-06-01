var eventEmitter = require('../services/event.js').eventEmitter;
var EVENTS = require('../services/constant.js').EVENTS;
var logger = require('winston');

// keep track of all connected clients
var clients = {};

var socketOnConnect =  function (socket) {
    clients[socket.id] = socket;


    // software upgrade status

    eventEmitter.removeAllListeners(EVENTS.APP_SOFTWARE_UPGRADE_PUBLISHED)
        .on(EVENTS.APP_SOFTWARE_UPGRADE_PUBLISHED, function(obj){
            socket.emit(EVENTS.SOCKET_SOFTWARE_UPGRADE_PUBLISHED, obj);
            socket.broadcast.emit(EVENTS.SOCKET_SOFTWARE_UPGRADE_PUBLISHED, obj);
        });

    eventEmitter.removeAllListeners(EVENTS.APP_SOFTWARE_UPGRADE_CONFIRMED)
        .on(EVENTS.APP_SOFTWARE_UPGRADE_CONFIRMED, function(obj){
            socket.emit(EVENTS.SOCKET_SOFTWARE_UPGRADE_CONFIRMED, obj);
            socket.broadcast.emit(EVENTS.SOCKET_SOFTWARE_UPGRADE_CONFIRMED, obj);
        });

    
    // gateway dead
    eventEmitter.removeAllListeners(EVENTS.APP_GATEWAY_DEAD)
        .on(EVENTS.APP_GATEWAY_DEAD, function(gatewayId){
            socket.emit(EVENTS.SOCKET_GATEWAY_DEAD, gatewayId);
            socket.broadcast.emit(EVENTS.SOCKET_GATEWAY_DEAD, gatewayId);
        });

    // gateway alive
    eventEmitter.removeAllListeners(EVENTS.APP_GATEWAY_ALIVE)
        .on(EVENTS.APP_GATEWAY_ALIVE, function(gatewayId){
            socket.emit(EVENTS.SOCKET_GATEWAY_ALIVE, gatewayId);
            socket.broadcast.emit(EVENTS.SOCKET_GATEWAY_ALIVE, gatewayId);
        });

    // resource added
    eventEmitter.removeAllListeners(EVENTS.APP_RESOURCE_ADDED)
        .on(EVENTS.APP_RESOURCE_ADDED, function(file){
            socket.emit(EVENTS.SOCKET_RESOURCE_ADDED, file);
            socket.broadcast.emit(EVENTS.SOCKET_RESOURCE_ADDED, file);
        });


    socket.on('disconnect', function() {
        logger.info('>>>> socket disconnect, deleting object socket.id: ' + socket.id);
        delete clients[socket.id];
    });

};

exports.socketOnConnect = socketOnConnect;
