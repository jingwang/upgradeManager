var eventEmitter = require('../services/event.js').eventEmitter;
var EVENTS = require('../services/constant.js').EVENTS;
var _ = require("underscore");
var logger = require('winston');


// keep track of all connected stations
var gateways = {}; // keep track of all stations timers
var keepalive = 300; // in seconds, if greater than, mark offline

var onAppStart =  function () {
    // gateway pinged
    eventEmitter.removeAllListeners(EVENTS.APP_GATEWAY_PINGED)
        .on(EVENTS.APP_GATEWAY_PINGED, function(gatewayId){
            if(gatewayId){
                // if timer exists, remove it first
                if(gateways[gatewayId]){
                    clearInterval(gateways[gatewayId]);
                }
                // create new timer to emit dead event every keepalive time
                var timer = setInterval(function(){
                    logger.debug(gatewayId + ": dead" );
                    eventEmitter.emit(EVENTS.APP_GATEWAY_DEAD, gatewayId);
                }, keepalive * 1000);

                // attach the timer to the station
                gateways[gatewayId] = timer;

                // emit alive event
                logger.debug(gatewayId + ": alive" );
                eventEmitter.emit(EVENTS.APP_GATEWAY_ALIVE, gatewayId);

            }

        });

    // gateway disconnected
    eventEmitter.removeAllListeners(EVENTS.APP_GATEWAY_UNPINGED)
        .on(EVENTS.APP_GATEWAY_UNPINGED, function(gatewayId){
            if(gatewayId){

                // delete the timer to the station
                delete gateways[gatewayId];

                // emit alive event
                logger.debug(gatewayId + ": dead" );
                eventEmitter.emit(EVENTS.APP_GATEWAY_DEAD, gatewayId);

            }

        });

};

exports.onAppStart = onAppStart;
