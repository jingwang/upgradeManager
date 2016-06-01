// app require
var express = require('express');
var fs = require('fs');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var multer = require('multer'); // handling multipart/form-data, which is primarily used for uploading files
var errorHandler = require('errorhandler');
var ConnectRoles = require('connect-roles');
var logger = require('winston');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
// local require
var config = require('../config.js')();
var routes = require('../routes/index.js');
var api = require('../routes/api.js');
var service = require('../services/index.js');
var socket = require('../services/socket.js');


// Bootstrap models
var models_path = __dirname + '/../collections';
fs.readdirSync(models_path).forEach(function (file) {
    if (~file.indexOf('.js')) {
        require(models_path + '/' + file);
    }
})

// api authentication
var apiUseAuthentication = function(req, res, next) {

    function unauthorized(res) {
        return res.sendStatus(401);
    };

    if(!req.user){
        return unauthorized(res);
    }else{
        next();
    }

};

var apiNoAuthentication = function(req, res, next) {
    req.user = {
        username: 'admin@gushenxing.com',
        name: 'Admin',
        role: 'admin'
    };
    next();
};

var initApp = function(app, ssl){

    // api authentication
    var apiAuthentication = apiNoAuthentication;
    if(ssl){
        apiAuthentication = apiUseAuthentication;
    }

    // passport config
    var User = require('../collections/user');
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    app.set('port', process.env.PORT || config.expressHttpPort);
    app.set('views', path.join(__dirname, '/../views'));
    app.set('view engine', 'ejs');
    app.engine('html', require('ejs').renderFile);
//app.use(favicon(__dirname + '/public/favicon.ico'));
    app.use(methodOverride());
    app.use(session({ resave: true,
        saveUninitialized: true,
        secret: 'uwotm8' }));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, '/../public')));
    app.use(morgan('combined', {
        skip: function (req, res) { return res.statusCode < 400 }
    }));
    if(ssl){
        app.use(passport.initialize());
        app.use(passport.session());
        // user role authorization
        var user = new ConnectRoles({
            failureHandler: function (req, res, action) {
                // optional function to customise code that runs when
                // user fails authorisation
                res.status(403);
                res.send('Access Denied - You don\'t have permission to: ' + action);
            }
        });

        app.use(user.middleware());

        user.use('upgrade', function (req) {
            if(req.user){
                return service.isAuthorized(req.user.role, 'upgrade');
            }
        })

        //admin users can access all pages
        user.use(function (req) {
            if(req.user){
                if (req.user.role === 'admin') {
                    return true;
                }
            }

        });
    }


    // development env
    if (app.get('env') === 'development') {
        logger.level = 'debug';
        logger.debug('running in development env');
        app.use(errorHandler({ dumpExceptions: true, showStack: true }));
    };

    // production only
    if (app.get('env') === 'production') {
        logger.debug('running in production env');
        app.use(errorHandler());
    };

    // login and logout url routing
    app.post('/login',
        passport.authenticate('local', { successRedirect: '/',
            failureRedirect: '/loginFail' })
    );


    app.get('/login', routes.login);
    app.get('/loginFail', routes.loginFail);
    app.get('/logout', routes.logout);


    // other url routing

    /** partial views **/
    app.get('/partial/:name', routes.partial);
    if(ssl){
        // let routes.index handle authentication
        app.get('/dashboard', routes.index);
        app.get('/dashboard/*', routes.index);
        app.get('/upgrade', routes.index);
        app.get('/upgrade/*', routes.index);
        // redirect all others to the index (HTML5 history)
        app.get('/', routes.index);

    } else {
        app.get('/dashboard', apiAuthentication, routes.index);
        app.get('/dashboard/*', apiAuthentication, routes.index);
        app.get('/upgrade', apiAuthentication, routes.index);
        app.get('/upgrade/*', apiAuthentication, routes.index);
        // redirect all others to the index (HTML5 history)
        app.get('/', apiAuthentication, routes.index);
    }

    // --JSON API--


    // station
    app.get('/api/gateway', apiAuthentication, api.getGateways);
    app.get('/api/gateway/gatewayId/:gatewayId', apiAuthentication, api.getGatewayByGatewayId);
    app.post('/api/gateway', apiAuthentication, api.saveGateway); // save or create a single station

// user authorization
    app.get('/api/isAuthorized/:page', apiAuthentication, api.isAuthorized);

// user
    app.get('/api/user/:username', apiAuthentication, api.getUser);
    app.get('/api/user', apiAuthentication, api.getUsers);
    app.post('/api/user', apiAuthentication, api.createUser);
    app.post('/api/user/update', apiAuthentication, api.updateUserProfile);
    app.post('/api/users/update', apiAuthentication, api.updateUserProfiles);

// validation
    app.post('/api/validate/username', apiAuthentication, api.validateUsername);


// station software upgrade
    app.get('/api/gatewaySoftwareUpgrade', apiAuthentication, api.getGatewaySoftwareUpgrades);
    app.get('/api/gatewaySoftwareUpgrade/gatewayId/:gatewayId', apiAuthentication, api.getGatewaySoftwareUpgradeByGatewayId);
    app.post('/api/gatewaySoftwareUpgrade', apiAuthentication, api.deployGatewaySoftwareUpgrade); // create or update

    // available resources
    app.get('/api/resources', apiAuthentication, api.getResources);

    // event log
    app.get('/api/eventLog', apiAuthentication, api.getEventLogs);
}


var onAppStart = function(ssl){

    // Connect to mongodb
    var connect = function () {
        var options = {
            server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
            replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
        };
        var conn = mongoose.connect(config.database, options);
    }
    connect();

    // mongoose error handler
    mongoose.connection.on('error', function (err) {
        logger.error(err);
    })

    // mongoose reconnect when closed
    mongoose.connection.on('disconnected', function () {
        connect();
    })

    // express server
    var app = express();

    initApp(app, ssl);

    var server = http.Server(app);

    // Hook Socket.io into Express
    var io = require('socket.io')(server);
    // Socket.io Communication
    io.on('connection', socket.socketOnConnect);
    // start server
    server.listen(app.get('port'), function(){
        logger.info('Express server listening on port ' + app.get('port') + ' @' + app.get('env'));
    });
}



exports.onAppStart = onAppStart;



