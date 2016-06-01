if(process.argv.length < 3){
    console.log('Usage:');
    console.log('node mqttClientTest.js clientId [nossl]');
    process.exit(0);
}

var ssl = true;
var clientId;

if(process.argv.length == 3){
    clientId = process.argv[2];
} else {
    clientId = process.argv[2];
    if(process.argv[3] == 'nossl'){
        ssl = false;
    }
}



if(clientId == undefined){
    console.log('clientId cannot be undefined');
    process.exit(0);
}

console.log(ssl);

var configuration = require('../config.js')();
var MessageObject = require('../services/messageObject.js');
var mqtt    = require('mqtt');
var _ = require("underscore");
var fs = require('fs');

var CA_CERT = __dirname + '/../ssl/' + configuration.mqttCaFile;

var TOPICS = require('../services/constant.js').TOPICS;


var client;

var options = {
    encoding: configuration.mqttEncoding,
    keepalive: configuration.mqttKeepalive, // keep alive for 60 second, so that it sends pingreq every 60 + 30 if there is no message publised
    clientId: clientId,
    username: configuration.mqttUsername,
    password: configuration.mqttPassword
    //rejectUnauthorized: false // using self-signed certificate
};

if(ssl) {
    options.caPaths = [CA_CERT];
    client = mqtt.createSecureClient(configuration.mqttsPort,configuration.mqttHost, options);
} else {
    client = mqtt.createClient(configuration.mqttPort, configuration.mqttHost, options);
}


client.on('connect', function () {

    var msgObj = new MessageObject(new Date(), JSON.stringify({
        version: '0.5',
        timestamp: new Date().getTime()
    }));

    client.publish(TOPICS.STATUS + '/' + clientId, msgObj.toBuffer());
    client.subscribe(TOPICS.UPGRADE + '/' + clientId, {qos: 1});
    client.subscribe(TOPICS.UPGRADE, {qos: 1});

});


client.on('message', function (topic, message) {
    console.log(topic);

    var receivedObj = new MessageObject();
    receivedObj.fromBuffer(message);
    var newVersion = receivedObj.getPayload();

    setTimeout(function(){
        var obj = new MessageObject(new Date(), JSON.stringify({
            version: newVersion?newVersion.trim():'0.5',
            timestamp: new Date().getTime()
        }));

        client.publish(TOPICS.STATUS + '/' + clientId, obj.toBuffer());

    }, 10000);

});

client.on('offline', function ()
{
    console.log('offline');
});

client.on('close', function ()
{
    console.log('close');
    client.end();
});



