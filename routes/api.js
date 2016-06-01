var _ = require("underscore");
var fs = require('fs');
var EVENTS = require('../services/constant.js').EVENTS;
var eventEmitter = require('../services/event.js').eventEmitter;
var service = require('../services/index.js');
var _ = require("underscore");
var logger = require('winston');

function constructEventLogQuery(req){
    var username = req.query.username?req.query.username:null;
    var gatewayId = req.query.gatewayId?req.query.gatewayId:null;
    var event = req.query.event?req.query.event:null;

    var query = {
        username: username,
        gatewayId: gatewayId,
        event: event
    };

    return query;
};


// gateway

exports.getGatewayByGatewayId = function (req, res) {
    var gatewayId = req.params.gatewayId;
    service.getGatewayByGatewayId(gatewayId, function(g){
        res.json({
            data: g
        });
    }, function(err){
        logger.error(err);
        res.status(500).send(err);
    })
};


exports.getGateways = function (req, res) {
    service.getGateways(function(gateways){
        res.json({
            data: gateways
        });
    }, function(err){
        logger.error(err);
        res.status(500).send(err);
    })
};


exports.saveGateway = function (req, res) {
    var gateway = req.body;
    var user = req.user;
    service.saveGateway(gateway, function(g){
        var eventLog = {
            username: user.username,
            event: EVENTS.EVENT_LOG_GATEWAY_MODIFIED,
            timestamp: new Date(),
            content: JSON.stringify(g),
            gatewayId: g.gatewayId
        }
        eventEmitter.emit(EVENTS.APP_EVENT_LOG, eventLog);
        res.json({
            data: g
        });

    }, function(err){
        logger.error(err);
        res.status(500).send(err);
    })

};




/** users **/
exports.createUser = function(req, res){

    var username = req.body.username;
    var password = req.body.password;
    var role = req.body.role;

    service.createUser(username, password, role, function(err, user){
        if(err || !user){
            res.json({
                error: 'USERNAME_EXISTS'
            });
        } else {
            res.json({
                data: user
            });
        }
    })

}


exports.changePassword = function(req, res){

    var username = req.body.username;
    var password = req.body.password;

    service.changePassword(username, password, function(err, user){
        if(err){
            res.json({
                error: 'ERROR'
            });
        } else {
            res.json({
                data: user
            });
        }

    })

}

exports.isAuthorized = function(req, res) {
    var authorized = false;
    var action = req.params.page;
    var user = req.user;
    if(user){
        var role = user.role;
        authorized = service.isAuthorized(role, action);
    }
    res.json(authorized);
}


exports.getUser = function(req, res) {
    var username = req.params.username;
    service.getUser(username, function(user){
        res.json({
            data: user
        });
    }, function(err){
        logger.error(err);
        res.status(500).send(err);
    })
}

exports.getUsers = function(req, res) {
    service.getUsers(function(users){
        res.json({
            data: users
        });
    }, function(err){
        logger.error(err);
        res.status(500).send(err);
    })
}

exports.updateUserProfile = function(req, res) {
    var user = req.body;
    service.updateUserProfile(user, function(user){
        res.json({
            data: user
        });
    }, function(err){
        logger.error(err);
        res.status(500).send(err);
    })
}

exports.updateUserProfiles = function(req, res) {
    var users = req.body;
    service.updateUserProfiles(users, function(user){
        res.json({
            data: user
        });
    }, function(err){
        logger.error(err);
        res.status(500).send(err);
    })
}

exports.validateUsername = function(req, res) {
    var data = req.body;
    var username = data.value;
    service.getUser(username, function(user){
        if(user && user.username){
            res.json({
                isValid: false, //Is the value received valid
                value: username //value received from server
            });
        } else {
            res.json({
                isValid: true, //Is the value received valid
                value: username //value received from server
            });
        }
    }, function(err){
        res.json({
            isValid: true, //Is the value received valid
            value: username //value received from server
        });
    })
}


exports.getGatewaySoftwareUpgrades = function (req, res) {

    service.getGatewaySoftwareUpgrades(function(ssus){
        res.json({
            data: ssus
        });
    }, function(err){
        logger.error(err);
        res.status(500).send(err);
    })
};


exports.getGatewaySoftwareUpgradeByGatewayId = function (req, res) {
    var gatewayId = req.params.gatewayId;
    service.getGatewaySoftwareUpgradeByGatewayId(gatewayId, function(ssu){
        res.json({
            data: ssu
        });
    }, function(err){
        logger.error(err);
        res.status(500).send(err);
    })
};

exports.deployGatewaySoftwareUpgrade = function (req, res) {
    var gsu = req.body;
    var user = req.user;

    var gatewayIds = gsu.gatewayIds; // a list of gatewayIds or undefined to indicate all gateways
    var softwareVersion = gsu.softwareVersion;

    // emit deploy event to be captured in mqttClient
    eventEmitter.emit(EVENTS.APP_DEPLOY_SOFTWARE_UPGRADE, {
        gatewayIds: gatewayIds,
        softwareVersion: softwareVersion
    });

    // event log
    if(gatewayIds == undefined){
        // update to all gateways
        service.getGatewaySoftwareUpgrades(function(gsus){
            if(gsus){
                for(var i = 0; i < gsus.length; i++){
                    var obj = gsus[i];
                    var eventLog = {
                        username: user.username,
                        event: EVENTS.EVENT_LOG_SOFTWARE_DEPLOYED,
                        timestamp: new Date(),
                        content: softwareVersion,
                        gatewayId: obj.gatewayId
                    }
                    eventEmitter.emit(EVENTS.APP_EVENT_LOG, eventLog);
                }
            }
        })
    } else {
        for(var i = 0; i < gatewayIds.length; i++){
            var gatewayId = gatewayIds[i];

            var eventLog = {
                username: user.username,
                event: EVENTS.EVENT_LOG_SOFTWARE_DEPLOYED,
                timestamp: new Date(),
                content: softwareVersion,
                gatewayId: gatewayId
            }
            eventEmitter.emit(EVENTS.APP_EVENT_LOG, eventLog);

        }
    }

    res.json({
        data: true
    });


};

exports.getResources = function (req, res) {
    service.getResources(function(files){
        res.json({
            data: files
        });
    }, function(err){
        logger.error(err);
        res.status(500).send(err);
    })
};

exports.getEventLogs = function(req, res) {
    var query = constructEventLogQuery(req);
    service.getEventLogs(query, function(logs){
        res.json({
            data: logs
        });
    }, function(err){
        logger.error(err);
        res.status(500).send(err);
    })
}
