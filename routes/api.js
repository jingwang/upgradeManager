var _ = require("underscore");
var fs = require('fs');
var EVENTS = require('../services/constant.js').EVENTS;
var USER_ROLES = require('../services/constant.js').USER_ROLES;
var eventEmitter = require('../services/event.js').eventEmitter;
var service = require('../services/index.js');
var _ = require("underscore");
var logger = require('winston');

function constructEventLogQuery(req){
    var query = {};
    if(req.query){
        var username = req.query.username?req.query.username:null;
        var gatewayId = req.query.gatewayId?req.query.gatewayId:null;
        var event = req.query.event?req.query.event:null;

        query = {
            username: username,
            gatewayId: gatewayId,
            event: event
        };
    }

    return query;
};

function constructGatewayQuery(req){
    var query = {};
    if(req.query){
        var companyId = req.query.companyId?req.query.companyId:null;
        query = {
            companyId: companyId
        };
    }
    return query;
};

// company
exports.getCompanyByCompanyId = function (req, res) {
    var companyId = req.params.companyId;
    service.getCompanyByCompanyId(companyId, function(c){
        res.json({
            data: c
        });
    }, function(err){
        logger.error(err);
        res.status(500).send(err);
    })
};


exports.getCompanies = function (req, res) {

    service.getCompanies(function(cs){
        res.json({
            data: cs
        });
    }, function(err){
        logger.error(err);
        res.status(500).send(err);
    })
};


exports.getCompaniesWithAuthorization = function (req, res) {
    var user = req.user;
    if(user && user.role != USER_ROLES.SUPER && user.companyId){
        service.getCompanyByCompanyId(user.companyId, function(c){
            res.json({
                data: [c]
            });
        }, function(err){
            logger.error(err);
            res.status(500).send(err);
        })
    } else if(user && user.role == USER_ROLES.SUPER){
        service.getCompanies(function(cs){
            res.json({
                data: cs
            });
        }, function(err){
            logger.error(err);
            res.status(500).send(err);
        })
    } else {
        res.json({
            data: []
        });
    }

};


exports.saveCompany = function (req, res) {
    var company = req.body;
    service.saveCompany(company, function(c){
        res.json({
            data: c
        });

    }, function(err){
        logger.error(err);
        res.status(500).send(err);
    })

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
    var query = constructGatewayQuery(req);
    service.getGateways(query, function(gateways){
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

// company and gateway
exports.getCompanyAndGateways = function(req, res) {
    var results = [];
    // get all companies
    service.getCompanies(function(companies){
        if(companies && companies.length){
            service.getGateways({}, function(gateways){
                for(var i = 0; i < companies.length; i++){
                    var company = companies[i];
                    company.gateways = [];
                    for(var j = 0; j < gateways.length; j++){
                        var gateway = gateways[j];
                        if(gateway.companyId == company.companyId){
                            company.gateways.push(gateway);
                        }
                    }
                    results.push(company);
                }
                res.json({
                    data: results
                });
            }, function(err){

            })
        }
        else {
            res.json({
                data: results
            });
        }
    }, function(err){
        logger.error(err);
        res.status(500).send(err);
    })

};

exports.getCompanyAndGatewaysWithAuthorization = function(req, res) {
    var results = [];
    var user = req.user;
    console.log(user);
    if(user && user.role == USER_ROLES.ADMIN && user.companyId){
        // get company by user.companyId
        service.getCompanyByCompanyId(user.companyId, function(company){
            console.log(company);
            if(company && company.companyId){
                service.getGatewaysByCompanyId(company.companyId, function(gateways){
                    company.gateways = gateways?gateways:[];
                    results.push(company);
                    res.json({
                        data: results
                    });
                }, function(err){

                })
            }
            else {
                res.json({
                    data: results
                });
            }
        }, function(err){
            logger.error(err);
            res.status(500).send(err);
        })
    } else if(user && user.role == USER_ROLES.SUPER){
        // get all companies
        service.getCompanies(function(companies){
            if(companies && companies.length){
                service.getGateways({}, function(gateways){
                    for(var i = 0; i < companies.length; i++){
                        var company = companies[i];
                        company.gateways = [];
                        for(var j = 0; j < gateways.length; j++){
                            var gateway = gateways[j];
                            if(gateway.companyId == company.companyId){
                                company.gateways.push(gateway);
                            }
                        }
                        results.push(company);
                    }
                    res.json({
                        data: results
                    });
                }, function(err){

                })
            }
            else {
                res.json({
                    data: results
                });
            }
        }, function(err){
            logger.error(err);
            res.status(500).send(err);
        })
    } else {
        // empty
        res.json({
            data: results
        });
    }

};


/** users **/
exports.createUser = function(req, res){
    var user = req.body;
    service.createUser(user, function(err, user){
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
};

exports.getUserRoles = function(req, res) {
    var user = req.user;

    if(user.role == USER_ROLES.SUPER) {
        res.json({
            data: [USER_ROLES.SUPER, USER_ROLES.ADMIN, USER_ROLES.USER]
        });
    } else if(user.role == USER_ROLES.ADMIN) {
        res.json({
            data: [USER_ROLES.ADMIN, USER_ROLES.USER]
        });
    } else {
        res.json({
            data: []
        });
    }

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

exports.getUsersWithAuthorization = function(req, res) {
    var user = req.user;
    if(user && user.role != USER_ROLES.SUPER && user.companyId) {
        service.getUsersByCompanyId(user.companyId, function(users){
            res.json({
                data: users
            });
        }, function(err){
            logger.error(err);
            res.status(500).send(err);
        })
    } else if(user && user.role == USER_ROLES.SUPER) {
        service.getUsers(function(users){
            res.json({
                data: users
            });
        }, function(err){
            logger.error(err);
            res.status(500).send(err);
        })
    } else {
        res.json({
            data: []
        });
    }

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
