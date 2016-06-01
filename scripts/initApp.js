/**
 * Initialize the application based on configurations
 * 1. wipe out all collections
 * 2. init default user
 */
var appConfig = require('../config.js')();
var services = require('../services/index.js');
var mongoose = require('mongoose');

require('../collections/user.js');
require('../collections/gateway.js');
require('../collections/gatewaySoftwareUpgrade.js');
require('../collections/eventLog.js');


var User = mongoose.model('User');

// Connect to mongodb
var connect = function () {
    var conn = mongoose.connect(appConfig.database);
}
connect();

// Error handler
mongoose.connection.on('error', function (err) {
    console.log(err);
})


var defaultUser = {
    username: 'admin@gushenxing.com',
    name: 'Admin',
    role: 'admin',
    password: 'gushenxing123'
};


console.log(defaultUser);

var promise = mongoose.model('Gateway').remove({}).exec();

promise.then(function () {
    console.log('Removed Gateway');
    return mongoose.model('EventLog').remove({}).exec();

}).then(function () {
    console.log('Removed EventLog');
    return mongoose.model('GatewaySoftwareUpgrade').remove({}).exec();

}).then(function () {
    console.log('Removed GatewaySoftwareUpgrade');

}).then(null, function (err) {
    console.log(err);
});

User.remove({}, function(err){
    if(!err){
        console.log('Removed User');
        User.register(new User(defaultUser), defaultUser.password, function(err1, user1) {
            if(err1){
                console.log(err1);
                mongoose.connection.close();
                process.exit(0);
            }else{
                console.log('Created user ' + user1.username  + ' with role ' + user1.role);
                mongoose.connection.close();
                process.exit(0);

            }
        });
    } else {
        console.log('Error removing User ');
        console.log(err);
        mongoose.connection.close();
        process.exit(0);
    }
});








