var ssl = true;

if(process.argv.length > 2){
    if(process.argv[2] == 'nossl'){
        ssl = false;
    }
}
if(ssl){
    console.log("Running Upgrade Manager in SSL mode");
}else{
    console.log("Running Upgrade Manager in NONE-SSL mode");
}

var mqttServer = require('./services/mqttServer.js');
var gatewayStatusListener = require('./services/statusListener.js');
var eventLogListener = require('./services/eventLogListener.js');
var mqttClient = require('./services/mqttClient.js');
var expressServer = require('./services/expressServer.js');
var resourceListener = require('./services/resourceListener.js');
var service = require('./services/index.js');

// start mqtt broker
mqttServer.onAppStart(ssl, function(){
    // start mqtt client
    mqttClient.onAppStart(ssl);
});
// start event log listener
eventLogListener.onAppStart();

// start gateway status listener
gatewayStatusListener.onAppStart();

// start resource listener
resourceListener.onAppStart();

// start express server
expressServer.onAppStart(ssl);