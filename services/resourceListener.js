var chokidar = require('chokidar');
var logger = require('winston');
var eventEmitter = require('../services/event.js').eventEmitter;
var EVENTS = require('../services/constant.js').EVENTS;
var configuration = require('../config.js')();
var index = require('../services/index.js');

var resourcesPath = configuration.resourcesPath;

var onAppStart =  function () {
    var watcher = chokidar.watch(resourcesPath, {
        ignored: /[\/\\]\./, persistent: true
    });

    var collectNewResource = function(path){
        var file = path.replace(resourcesPath, "").replace(/^\//, '');
        if(file == parseFloat(file)){
            logger.debug('File', file, 'has been added');
            eventEmitter.emit(EVENTS.APP_RESOURCE_ADDED, file);
            eventEmitter.emit(EVENTS.APP_PUBLISH_LATEST_VERSION, file);
        }
    };

    var collectAllResources = function(paht) {
        var files = index.getResourcesSync();
        if(files && files.length){
            logger.debug('Resources have changed');
            eventEmitter.emit(EVENTS.APP_RESOURCE_UPDATED, files);
        }
    };

    // capture events if a file is added/removed from the folder
    watcher.on('add', function(path) {
        collectNewResource(path);
        collectAllResources(path);
    }).on('unlink', function(path) {
        collectAllResources(path);
    });
};

exports.onAppStart = onAppStart;


