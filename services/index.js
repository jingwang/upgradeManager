var uuid = require('node-uuid');
var mongoose = require('mongoose');
var _ = require("underscore");
var fs = require('fs');
var configuration = require('../config.js')();
var roleAuthorization = require('../services/roleAuthorization.js').roleAuthorization;
var logger = require('winston');
var xml2js = require('xml2js');


function isInt(value) {
    var x;
    if (isNaN(value)) {
        return false;
    }
    x = parseFloat(value);
    return (x | 0) === x;
}



// Gateway
exports.getGatewayByGatewayId = function(gatewayId, callback, errCallback) {
    var promise = mongoose.model('Gateway').findOne({gatewayId: gatewayId}).exec();
    promise.then(function (gw) {
        if(callback){
            if(gw){
                callback(gw.toObject());
            } else {
                callback(null);
            }

        }

    }).then(null, function (err) {
        if(errCallback){
            errCallback(err);
        }
    });

};


exports.getGateways = function(callback, errCallback) {
    mongoose.model('Gateway').find({}, function (err, docs) {
        if(err){
            logger.error(err);
            if(errCallback){
                errCallback(err);
            }
        }else{
            if(callback){
                if(docs){
                    var objs = [];
                    for(var i = 0; i < docs.length; i++){
                        objs.push(docs[i].toObject());
                    }

                    callback(objs);
                }
                else {
                    callback({});
                }

            }
        }
    });
};


exports.saveGateway = function(gateway, callback, errCallback) {
    if(gateway && gateway._id){
        mongoose.model('Gateway').findOneAndUpdate({_id: gateway._id}, gateway, {upsert: false}, function (err, g) {
            if(err){
                logger.error(err);
                if(errCallback){
                    errCallback(err);
                }
            }else{
                if(callback){
                    if(doc){
                        callback(g.toObject());
                    }
                    else {
                        callback({});
                    }

                }
            }
        })
    }

    else if(gateway){

        mongoose.model('Gateway').create(gateway, function (err, g) {
            if (err){
                logger.error(err);
                if(errCallback){
                    errCallback(err);
                }
            } else {
                if(callback){
                    callback(g.toObject());
                }
            }
        });

    }
};



// User
exports.createUser = function(username, password, role, callback){
    var User = mongoose.model('User');
    User.register(new User({ username : username, role: role }), password, function(err, user) {
        if(callback){
            callback(err, user);
        }

    });

};



var changePassword = function(username, password, callback, errCallback){
    var User = mongoose.model('User');
    User.findByUsername(username).then(function(sanitizedUser){
        if (sanitizedUser){
            sanitizedUser.setPassword(password, function(){
                sanitizedUser.save();
                if(callback){
                    callback(sanitizedUser);
                }
            });
        } else {
            if(errCallback){
                errCallback('No such user: ' + username);
            }
        }
    },function(err){
        logger.error(err);
        if(errCallback){
            errCallback('Error finding user with ' + username);
        }
    })

};

exports.updateUserProfile = function(user, callback, errCallback) {
    var User = mongoose.model('User');
    if(user.name && user.username) {
        User.findOneAndUpdate({username: user.username}, {$set: {name: user.name}}, {new: true}, function(err, newUser) {
            if(!err){
                if(user.password){
                    changePassword(user.username, user.password, callback, errCallback);
                }
                else {
                    callback(newUser.toObject());
                }
            } else {
                if(errCallback){
                    errCallback(err);
                }
            }
        })
    } else if(user.password && user.username){
        changePassword(user.username, user.password, callback, errCallback);
    }
};

exports.updateUserProfiles = function(users, callback, errCallback) {

    var q = require('q');
    var promiseList = [];
    var User = mongoose.model('User');

    for(var i = 0; i < users.length; i++){
        var user = users[i];
        var username = user.username;
        var role = user.role;
        var promise = User.findOneAndUpdate({username: username}, {$set: {role: role}}, {new: true}).exec();
        promiseList.push(promise);
    }

    q.all(promiseList).then(function(usrs){
        User.find(function(err, modified) {

            if(callback){
                callback(modified);
            }

        });
    });

};


exports.getUser = function(username, callback, errCallback) {
    var User = mongoose.model('User');
    User.findOne({username: username}, function(err, doc) {
        if(doc){
            if(callback){
                callback(doc.toObject());
            }
        }
        else {
            logger.info('Cannnot find user by ' + username);
            if(errCallback){
                errCallback();
            }
        }

    });
};

exports.getUsers = function(callback, errCallback) {
    var User = mongoose.model('User');
    User.find(function(err, docs) {
        if(docs){
            if(callback){
                callback(docs);
            }
        }
        else {

            if(errCallback){
                errCallback();
            }
        }

    });
};



exports.isAuthorized = function(role, action) {
    var authorized = false;
    var allowed = roleAuthorization[role];
    if(allowed){
        for(var i = 0; i < allowed.length; i++){
            if(allowed[i] == action){
                authorized = true;
            }
        }
    }
    return authorized;
};


// Event Log

exports.saveEventLog = function(eventLog, callback, errCallback){
    mongoose.model('EventLog').create(eventLog, function (err, ev) {
        if (err){
            logger.error(err);
            if(errCallback){
                errCallback(err);
            }
        } else {
            if(callback){
                callback(ev.toObject());
            }
        }
    });
};

exports.getEventLogs = function(query, callback, errCallback){
    var condition = {};
    if(query && query.gatewayId){
        condition.gatewayId = query.gatewayId;
    }
    if(query && query.username){
        condition.username = query.username;
    }
    if(query && query.event){
        condition.event = query.event;
    }

    mongoose.model('EventLog').find(condition, null, { sort: { timestamp: 1 }}, function (err, docs) {
        if(err){
            logger.error(err);
            if(errCallback){
                errCallback(err);
            }
        }else{

            if(callback){
                if(docs){
                    var objs = [];
                    for(var i = 0; i < docs.length; i++){
                        objs.push(docs[i].toObject());
                    }
                    callback(objs);
                }
                else {
                    callback({});
                }

            }
        }
    });

};


// GatewaySoftwareUpgrade

exports.getGatewaySoftwareUpgrades = function(callback, errCallback) {
    mongoose.model('GatewaySoftwareUpgrade').find({}, function (err, docs) {
        if(err){
            logger.error(err);
            if(errCallback){
                errCallback(err);
            }
        }else{
            if(callback){
                if(docs){
                    var objs = [];
                    for(var i = 0; i < docs.length; i++){
                        objs.push(docs[i].toObject());
                    }
                    callback(objs);
                }
                else {
                    callback({});
                }

            }
        }
    });
};

exports.getGatewaySoftwareUpgradeByGatewayId = function(gatewayId, callback, errCallback) {
    var promise = mongoose.model('GatewaySoftwareUpgrade').findOne({gatewayId: gatewayId}).exec();
    promise.then(function (ssu) {
        if(callback){
            var dc = ssu.toObject();
            callback(dc);
        }

    }).then(null, function (err) {
        if(errCallback){
            errCallback(err);
        }
    });
};

exports.saveGatewaySoftwareUpgrade = function(gsu, callback, errCallback) {

    mongoose.model('GatewaySoftwareUpgrade').findOne({gatewayId: gsu.gatewayId}, function (err, g) {
        if(g){
            g = g.toObject();
            for (var key in g) {
                if (g.hasOwnProperty(key) && gsu[key]){
                    g[key] = gsu[key];
                }
            }
            mongoose.model('GatewaySoftwareUpgrade').findOneAndUpdate({_id: g._id}, g, {new: true}, function (err, newG) {
                if(callback){
                    callback(newG.toObject());
                }
            })

        } else {
            mongoose.model('GatewaySoftwareUpgrade').create(gsu, function (err, g) {
                if (err){
                    logger.error(err);
                    if(errCallback){
                        errCallback(err);
                    }
                } else {
                    if(callback){
                        callback(g.toObject());
                    }
                }
            });
        }
    })
};

exports.getResources = function(callback, errCallback) {
    var resourcesPath = configuration.resourcesPath;
    fs.readdir(resourcesPath, function(err, files){
        if(err){
            if(errCallback){
                errCallback(err);
            }
        } else {
            var resources = [];
            if(files){
                for(var i = 0; i < files.length; i++){
                    var file = files[i];
                    // only pick files in the format of a float (e.g., 1.0, 1.1)
                    if(file == parseFloat(file)){
                        resources.push(file);
                    }
                }
            }
            resources.sort(function(a, b) {
                return parseFloat(b) - parseFloat(a);
            });

            if(callback){
                callback(resources);
            }
        }

    })
};








