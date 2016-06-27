var configuration = require('../config.js')();
var mqtt    = require('mqtt');
var fs = require('fs');
var _ = require("underscore");
var MessageObject = require('../services/messageObject.js');
var EVENTS = require('../services/constant.js').EVENTS;
var TOPICS = require('../services/constant.js').TOPICS;
var MESSAGE_STATUSES = require('../services/constant.js').MESSAGE_STATUSES;
var eventEmitter = require('../services/event.js').eventEmitter;
var mongoose = require('mongoose');
var service = require('../services/index.js');
var util = require('util');
var logger = require('winston');
var CA_CERT = __dirname + '/../ssl/' + configuration.mqttCaFile;
var resourcesPath = configuration.resourcesPath;

var options = {
    encoding: configuration.mqttEncoding,
    keepalive: configuration.mqttKeepalive, // keep alive for 60 second, so that it sends pingreq every 60 + 30 if there is no message publised
    clientId: configuration.mqttClientId,
    username: configuration.mqttUsername,
    password: configuration.mqttPassword,
    //rejectUnauthorized: false, // using self-signed certificate
    caPaths: [CA_CERT]
};

var optionsNoSsl = {
    encoding: configuration.mqttEncoding,
    keepalive: configuration.mqttKeepalive, // keep alive for 60 second, so that it sends pingreq every 60 + 30 if there is no message publised
    clientId: configuration.mqttClientId,
    username: configuration.mqttUsername,
    password: configuration.mqttPassword
};


var onAppStart =  function (ssl) {
    var client;
    if(ssl){
        client = mqtt.createSecureClient(configuration.mqttsPort, configuration.mqttHost, options);
    } else {
        client = mqtt.createClient(configuration.mqttPort, configuration.mqttHost, optionsNoSsl);
    }

    // helper functions
    var publishLatestVersion = function(client, gatewayId){
        var files = service.getResourcesSync();
        var version = '';
        if(files && files.length){
            version = files[0];
        }

        var messageObj = new MessageObject(new Date(), JSON.stringify({
            version: version
        }));

        var messageBuffer = messageObj.toBuffer();
        if(gatewayId){
            client.publish(TOPICS.TOGATEWAY_LATEST_VERSION + '/' + gatewayId, messageBuffer, {qos: 1});
        } else {
            client.publish(TOPICS.TOGATEWAY_LATEST_VERSION, messageBuffer, {qos: 1});
        }

    };

    var publishAvailableVersions = function(client, gatewayId){
        var files = service.getResourcesSync();
        var versions = [];
        if(files && files.length){
            versions = files;
        }

        var messageObj = new MessageObject(new Date(), JSON.stringify({
            versions: versions
        }));

        var messageBuffer = messageObj.toBuffer();
        if(gatewayId){
            client.publish(TOPICS.TOGATEWAY_AVAILABLE_VERSIONS + '/' + gatewayId, messageBuffer, {qos: 1});
        } else {
            client.publish(TOPICS.TOGATEWAY_AVAILABLE_VERSIONS, messageBuffer, {qos: 1});
        }

    };

    // listen to event to publish TOGATEWAY message

    eventEmitter.removeAllListeners(EVENTS.APP_PUBLISH_LATEST_VERSION)
        .on(EVENTS.APP_PUBLISH_LATEST_VERSION, function(file){
            publishLatestVersion(client);
        });

    eventEmitter.removeAllListeners(EVENTS.APP_PUBLISH_AVAILABLE_VERSIONS)
        .on(EVENTS.APP_PUBLISH_AVAILABLE_VERSIONS, function(file){
            publishAvailableVersions(client);
        });


    eventEmitter.removeAllListeners(EVENTS.APP_DEPLOY_SOFTWARE_UPGRADE)
        .on(EVENTS.APP_DEPLOY_SOFTWARE_UPGRADE, function(obj){
            var gatewayIds = obj.gatewayIds; // a list of gatewayIds or null to indicate all gateways
            var softwareVersion = obj.softwareVersion;

            //TODO: construct executablePath and read executable
            fs.readFile(resourcesPath + '/' + softwareVersion, function(err, data){
                if(data){
                    var content = data.toString();
                    var msgObj = new MessageObject(new Date(), content);
                    var messageBuffer = msgObj.toBuffer();

                    // upgrade all gateways
                    if(!gatewayIds){
                        client.publish(TOPICS.TOGATEWAY_UPGRADE, messageBuffer, {qos: 1});
                        service.getGatewaySoftwareUpgrades(function(objs){
                            if(objs){
                                for(var i = 0; i < objs.length; i++){
                                    var obj = objs[i];
                                    obj.softwareVersion = softwareVersion;
                                    obj.softwareUpgradeTimestampMillis = new Date().getTime();
                                    obj.status = MESSAGE_STATUSES.PUBLISHED;
                                    service.saveGatewaySoftwareUpgrade(obj, function(obj){
                                        eventEmitter.emit(EVENTS.APP_SOFTWARE_UPGRADE_PUBLISHED, {
                                            gatewayId: obj.gatewayId,
                                            softwareVersion: obj.softwareVersion
                                        });
                                    });
                                }
                            }

                        });

                    }
                    // upgrade specific gateway(s)
                    else {
                        for(var i = 0; i < gatewayIds.length; i++){
                            var gatewayId = gatewayIds[i];
                            client.publish(TOPICS.TOGATEWAY_UPGRADE + '/' + gatewayIds[i], messageBuffer, {qos: 1});

                            var gsu = {
                                gatewayId: gatewayId,
                                softwareVersion: softwareVersion,
                                softwareUpgradeTimestampMillis: new Date().getTime(),
                                status: MESSAGE_STATUSES.PUBLISHED
                            };
                            service.saveGatewaySoftwareUpgrade(gsu, function(obj){
                                eventEmitter.emit(EVENTS.APP_SOFTWARE_UPGRADE_PUBLISHED, {
                                    gatewayId: obj.gatewayId,
                                    softwareVersion: obj.softwareVersion
                                });
                            });

                        }
                    }
                }


            })


        });


    // subscribe to all TOCLOUD messages
    client.on('connect', function () {
        // subscribe to all TOCLOUD topics
        client.subscribe(TOPICS.TOCLOUD_STATUS + '/+');
        client.subscribe(TOPICS.TOCLOUD_REQUEST_LATEST_VERSION + '/+');
        client.subscribe(TOPICS.TOCLOUD_REQUEST_AVAILABLE_VERSIONS + '/+');
        client.subscribe(TOPICS.TOCLOUD_REQUEST_UPGRADE + '/+');

    });


    client.on('message', function (topic, message) {
        logger.debug('received topic: ' + topic);
        // message is Buffer
        var topicName, gatewayId;
        var topicSections = topic.split('/');
        if(topicSections.length == 3){
            topicName = topicSections[0] + '/' + topicSections[1];
            gatewayId = topicSections[2];
        }

        if(topicName == TOPICS.TOCLOUD_STATUS && gatewayId != undefined) {
            var receivedObj = new MessageObject();
            receivedObj.fromBuffer(message);
            var statusJson = receivedObj.getPayloadJson();
            if(statusJson){
                var companyId = statusJson.companyId;

                // if company does not exist, create one in company collection
                service.getCompanyByCompanyId(companyId, function(c){
                    if(!c){
                        var company = {
                            companyId: companyId,
                            name: 'New Company ' + companyId // give it a default name
                        };
                        service.saveCompany(company, function(newC){
                            logger.debug('new company created with companyId: ' + companyId);
                        })
                    }
                });


                // if gateway does not exist, create one in gateway collection
                service.getGatewayByGatewayId(gatewayId, function(gw){
                    if(!gw){
                        var gateway = {
                            companyId: companyId,
                            gatewayId: gatewayId,
                            name: 'New Gateway ' + gatewayId // give it a default name
                        };
                        service.saveGateway(gateway, function(newGw){
                            logger.debug('new gateway created with gatewayId: ' + gatewayId);
                        })
                    }
                });

                var gsu = {
                    gatewayId: gatewayId,
                    softwareVersion: statusJson.version,
                    softwareUpgradeTimestampMillis: parseInt(statusJson.timestamp), // milli-second,
                    status: MESSAGE_STATUSES.CONFIRMED // PUBLISHED/CONFIRMED
                };
                service.saveGatewaySoftwareUpgrade(gsu, function(obj){
                    eventEmitter.emit(EVENTS.APP_SOFTWARE_UPGRADE_CONFIRMED, {
                        gatewayId: obj.gatewayId,
                        softwareVersion: obj.softwareVersion
                    });
                });
            }
        }
        else if(topicName == TOPICS.TOCLOUD_REQUEST_LATEST_VERSION && gatewayId != undefined){
            publishLatestVersion(client, gatewayId);
        }
        else if(topicName == TOPICS.TOCLOUD_REQUEST_UPGRADE && gatewayId != undefined){

            var receivedObj = new MessageObject();
            receivedObj.fromBuffer(message);
            var requestJson = receivedObj.getPayloadJson();
            if(requestJson){
                var version = requestJson.version;
                //TODO: construct executablePath and read executable
                fs.readFile(resourcesPath + '/' + version, function(err, data){
                    if(err){
                        logger.debug(err);
                    }
                    if(data){
                        var content = data.toString();
                        var msgObj = new MessageObject(new Date(), content);
                        var messageBuffer = msgObj.toBuffer();
                        client.publish(TOPICS.TOGATEWAY_DOWNLOAD_UPGRADE + '/' + gatewayId, messageBuffer, {qos: 1});

                    }
                })
            }

        }
        else if(topicName == TOPICS.TOCLOUD_REQUEST_AVAILABLE_VERSIONS && gatewayId != undefined){
            publishAvailableVersions(client, gatewayId);
        }

        //    client.end();
    });
}

exports.onAppStart = onAppStart;



