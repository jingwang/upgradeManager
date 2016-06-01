var eventEmitter = require('../services/event.js').eventEmitter;
var EVENTS = require('../services/constant.js').EVENTS;
var service = require('../services/index.js');
var logger = require('winston');


var onAppStart =  function () {

    eventEmitter.removeAllListeners(EVENTS.APP_EVENT_LOG)
        .on(EVENTS.APP_EVENT_LOG, function(eventObj){
            service.saveEventLog(eventObj, function(evt){
                logger.debug('saved event: ' + eventObj.username + ": " + eventObj.event);
            })
        });

};

exports.onAppStart = onAppStart;
