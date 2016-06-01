var mosca = require('mosca');
var config = require('../config.js')();
var logger = require('winston');
var service = require('../services/index.js');
var eventEmitter = require('../services/event.js').eventEmitter;
var EVENTS = require('../services/constant.js').EVENTS;

var SECURE_KEY = __dirname + '/../ssl/' + config.mqttKeyFile;
var SECURE_CERT = __dirname + '/../ssl/' + config.mqttCrtFile;

var backendSettings = {
    //using ascoltatore
    type: 'mongo',
    url: config.mqttDatabase,
    pubsubCollection: config.mqttPubsubCollection,
    mongo: {},
    logger: {level: 'debug'}
};

var moscaSetting = {
    host: config.mqttHost, // comment this when deploy to the cloud
    interfaces: [
        { type: "mqtt", port: config.mqttPort },
        { type: "mqtts", port: config.mqttsPort, credentials: { keyPath: SECURE_KEY, certPath: SECURE_CERT } },
        { type: "http", port: config.mqttHttpPort, bundle: true },
        { type: "https", port: config.mqttHttpsPort, bundle: true, credentials: { keyPath: SECURE_KEY, certPath: SECURE_CERT } }
    ],
    stats: false,

    logger: { name: 'MoscaServer', level: 'debug' },

    //persistence: { factory: mosca.persistence.Redis, url: 'localhost:6379', ttl: { subscriptions: 1000 * 60 * 10, packets: 1000 * 60 * 10 } },

    //backend: pubsubSettings, // uncomment this when deploy to the cloud
};

var moscaSettingNoSsl = {
    host: config.mqttHost, // comment this when deploy to the cloud
    interfaces: [
        { type: "mqtt", port: config.mqttPort }
    ],
    stats: false,

    logger: { name: 'MoscaServer', level: 'debug' },

    //persistence: { factory: mosca.persistence.Redis, url: 'localhost:6379', ttl: { subscriptions: 1000 * 60 * 10, packets: 1000 * 60 * 10 } },

    //backend: pubsubSettings, // uncomment this when deploy to the cloud
};


// Accepts the connection if the username and password are valid
var authenticate = function(client, username, password, callback) {
    var authorized = (username === config.mqttUsername && password.toString() === config.mqttPassword);
    if (authorized) client.user = username;
    callback(null, authorized);
}

// In this case the client authorized as alice can publish to /users/alice taking
// the username from the topic and verifing it is the same of the authorized user
var authorizePublish = function(client, topic, payload, callback) {
    //callback(null, client.user == topic.split('/')[1]);
    callback(null, true);
}

// In this case the client authorized as alice can subscribe to /users/alice taking
// the username from the topic and verifing it is the same of the authorized user
var authorizeSubscribe = function(client, topic, callback) {
    //callback(null, client.user == topic.split('/')[1]);
    callback(null, true);
}


var onAppStart =  function (ssl, callback) {
    var mqttServer;
    if(ssl){
        mqttServer = new mosca.Server(moscaSetting);
    }else {
        mqttServer = new mosca.Server(moscaSettingNoSsl);
    }

    function setup() {
        mqttServer.authenticate = authenticate;
        mqttServer.authorizePublish = authorizePublish;
        mqttServer.authorizeSubscribe = authorizeSubscribe;
        logger.info('Mosca server is up and running');
        if(callback){
            callback();
        }

    }

    mqttServer.on("error", function (err) {
        logger.debug(err);
    });

    mqttServer.on('clientConnected', function(client) {
        logger.debug('MOSCA DETECTS: connected: ', 'CLIENTID: ', client?client.id:'');
        if(client){
            eventEmitter.emit(EVENTS.APP_GATEWAY_PINGED, client.id);
        }
    });

    mqttServer.on('clientDisconnected', function(client) {
        logger.debug('MOSCA DETECTS: DISconnected: ', 'CLIENTID: ', client?client.id:'');
        if(client){
            eventEmitter.emit(EVENTS.APP_GATEWAY_UNPINGED, client.id);
        }
    });

    mqttServer.on('pingreq', function(client) {
        logger.debug('MOSCA DETECTS: pingreq: ', 'CLIENTID: ', client?client.id:'');
        if(client){
            eventEmitter.emit(EVENTS.APP_GATEWAY_PINGED, client.id);
        }
    });

    // for Qo1 message, a delivered event is fired to confirm delivery
    mqttServer.on('delivered', function(packet, client) {
        logger.debug('MOSCA DETECTS: delivered: ', packet.payload, 'CLIENTID: ', client?client.id:'');
        // delivered also triggers pinged event
        if(client){
            eventEmitter.emit(EVENTS.APP_GATEWAY_PINGED, client.id);
        }

    });

    mqttServer.on('subscribed', function(topic, client) {
        logger.debug('MOSCA DETECTS: subscribed: ', topic, 'CLIENTID: ', client?client.id:'');
        if(client){
            eventEmitter.emit(EVENTS.APP_GATEWAY_PINGED, client.id);
        }
    });

    mqttServer.on('unsubscribed', function(topic, client) {
        logger.debug('MOSCA DETECTS: UN-subscribed: ', topic, 'CLIENTID: ', client?client.id:'');
    });

    // fired when a message is received
    mqttServer.on('published', function(packet, client) {
        logger.debug('MOSCA DETECTS: published: ', packet.payload, 'CLIENTID: ', client?client.id:'');
        if(client){
            eventEmitter.emit(EVENTS.APP_GATEWAY_PINGED, client.id);
        }
    });

    mqttServer.on('ready', setup);

};

exports.onAppStart = onAppStart;
