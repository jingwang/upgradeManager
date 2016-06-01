var chokidar = require('chokidar');
var logger = require('winston');
var eventEmitter = require('../services/event.js').eventEmitter;
var EVENTS = require('../services/constant.js').EVENTS;
var configuration = require('../config.js')();

var resourcesPath = configuration.resourcesPath;

var onAppStart =  function () {
    var watcher = chokidar.watch(resourcesPath, {
        ignored: /[\/\\]\./, persistent: true
    });

    watcher.on('add', function(path) {
        var file = path.replace(resourcesPath, "").replace(/^\//, '');
        if(file == parseFloat(file)){
            logger.debug('File', file, 'has been added');
            eventEmitter.emit(EVENTS.APP_RESOURCE_ADDED, file);
        }
    })
};

exports.onAppStart = onAppStart;


