/**
 * Populate a few sample companies
 */
var appConfig = require('../config.js')();
var services = require('../services/index.js');
var mongoose = require('mongoose');


require('../collections/company.js');


// Connect to mongodb
var connect = function () {
    var conn = mongoose.connect(appConfig.database);
};
connect();

// Error handler
mongoose.connection.on('error', function (err) {
    console.log(err);
});

var companies = [
    {
        companyId: '2',
        name: 'Company 2',
        registered: true
    },
    {
        companyId: '3',
        name: 'Company 3',
        registered: false
    }
];

var promise = mongoose.model('Company').create(companies);

promise.then(function (coms) {
    console.log('Populated ' + coms.length + ' companies');
    mongoose.connection.close();
    process.exit(0);

}).then(null, function (err) {
    console.log(err);
    mongoose.connection.close();
    process.exit(0);
});










