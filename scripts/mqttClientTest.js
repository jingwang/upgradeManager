if(process.argv.length < 4){
    console.log('Usage:');
    console.log('node mqttClientTest.js gatewayId companyId [nossl]');
    process.exit(0);
}

var ssl = true;
var clientId;
var companyId;

if(process.argv.length == 4){
    clientId = process.argv[2];
    companyId = process.argv[3];
} else {
    clientId = process.argv[2];
    companyId = process.argv[3];
    if(process.argv[4] == 'nossl'){
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

    var statusObj = new MessageObject(new Date(), JSON.stringify({
        companyId: companyId,
        version: '0.5',
        timestamp: new Date().getTime()
    }));

    var requestLatestObj = new MessageObject(new Date(), ' ');

    // send status at startup
    client.publish(TOPICS.TOCLOUD_STATUS + '/' + clientId, statusObj.toBuffer());

    // send request for latest version and available versions at startup
    client.publish(TOPICS.TOCLOUD_REQUEST_LATEST_VERSION + '/' + clientId, requestLatestObj.toBuffer());
    client.publish(TOPICS.TOCLOUD_REQUEST_AVAILABLE_VERSIONS + '/' + clientId, requestLatestObj.toBuffer());

    // subscribe to topics
    client.subscribe(TOPICS.TOGATEWAY_UPGRADE + '/' + clientId, {qos: 1});
    client.subscribe(TOPICS.TOGATEWAY_UPGRADE, {qos: 1});
    client.subscribe(TOPICS.TOGATEWAY_LATEST_VERSION + '/' + clientId, {qos: 1});
    client.subscribe(TOPICS.TOGATEWAY_LATEST_VERSION, {qos: 1});
    client.subscribe(TOPICS.TOGATEWAY_AVAILABLE_VERSIONS + '/' + clientId, {qos: 1});
    client.subscribe(TOPICS.TOGATEWAY_AVAILABLE_VERSIONS, {qos: 1});
    client.subscribe(TOPICS.TOGATEWAY_DOWNLOAD_UPGRADE + '/' + clientId, {qos: 1});
    client.subscribe(TOPICS.TOGATEWAY_DOWNLOAD_UPGRADE, {qos: 1});

    // simulate sending request for latest version and available versions every minute
    setInterval(function(){
        client.publish(TOPICS.TOCLOUD_REQUEST_LATEST_VERSION + '/' + clientId, requestLatestObj.toBuffer());
        client.publish(TOPICS.TOCLOUD_REQUEST_AVAILABLE_VERSIONS + '/' + clientId, requestLatestObj.toBuffer());

    }, 60000);

});


client.on('message', function (topic, message) {
    console.log(topic);
    var topicName;
    var topicSections = topic.split('/');
    if(topicSections.length > 1){
        topicName = topicSections[0] + '/' + topicSections[1];
    }

    if(topicName == TOPICS.TOGATEWAY_UPGRADE) {
        var receivedObj = new MessageObject();
        receivedObj.fromBuffer(message);
        var newVersion = receivedObj.getPayload();

        setTimeout(function(){
            var obj = new MessageObject(new Date(), JSON.stringify({
                companyId: companyId,
                version: newVersion?newVersion.trim():'0.5',
                timestamp: new Date().getTime()
            }));

            client.publish(TOPICS.TOCLOUD_STATUS + '/' + clientId, obj.toBuffer());

        }, 10000);
    }

    else if(topicName == TOPICS.TOGATEWAY_LATEST_VERSION) {
        var receivedObj = new MessageObject();
        receivedObj.fromBuffer(message);
        var json = receivedObj.getPayloadJson();
        if(json){
            var version = json.version;
            console.log('Latest version: ' + version);

            // simulate request download
            var obj = new MessageObject(new Date(), JSON.stringify({
                version: version,
            }));

            client.publish(TOPICS.TOCLOUD_REQUEST_UPGRADE + '/' + clientId, obj.toBuffer());
        }
    }

    else if(topicName == TOPICS.TOGATEWAY_AVAILABLE_VERSIONS) {
        var receivedObj = new MessageObject();
        receivedObj.fromBuffer(message);
        var json = receivedObj.getPayloadJson();
        if(json){
            var versions = json.versions;
            console.log('Available versions: ' + versions);
        }
    }

    else if(topicName == TOPICS.TOGATEWAY_DOWNLOAD_UPGRADE) {
        console.log('New version downloaded');
    }


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



