var events = require('events');
var eventEmitter = new events.EventEmitter();
eventEmitter.setMaxListeners(Infinity);

exports.eventEmitter = eventEmitter;
