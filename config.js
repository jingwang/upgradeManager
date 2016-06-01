var config = {
    development: {
        database: 'mongodb://127.0.0.1/upgradeManagerDev',
        // following is mqtt config
        mqttHost: 'mqtt.gushenxing.com',
        mqttPort: 6999,
        mqttsPort: 7883,
        mqttHttpPort: 3000,
        mqttHttpsPort: 3001,
        mqttDatabase: 'mongodb://127.0.0.1/upgradeManagerMqtt',
        mqttPubsubCollection: 'pubsub',
        mqttClientId: 'platform',
        mqttUsername: 'user',
        mqttPassword: 'password',
        mqttKeepalive: 30,
        mqttEncoding: 'binary',
        mqttKeyFile: 'mqtt.gushenxing.com.server.unencripted.key',
        mqttCrtFile: 'mqtt.gushenxing.com.server.crt',
        mqttCaFile: 'mqtt.gushenxing.com.ca.crt',
        // express server
        expressHttpPort: 5001,
        resourcesPath: __dirname + '/' + 'resources'
    },
    production: {
        database: 'mongodb://127.0.0.1/upgradeManager',
        // following is mqtt config
        mqttHost: 'mqtt.gushenxing.com',
        mqttPort: 6999,
        mqttsPort: 7883,
        mqttHttpPort: 3000,
        mqttHttpsPort: 3001,
        mqttDatabase: 'mongodb://127.0.0.1/upgradeManagerMqtt',
        mqttPubsubCollection: 'pubsub',
        mqttClientId: 'platform',
        mqttUsername: 'user',
        mqttPassword: 'password',
        mqttKeepalive: 30,
        mqttEncoding: 'binary',
        mqttKeyFile: 'mqtt.gushenxing.com.server.unencripted.key',
        mqttCrtFile: 'mqtt.gushenxing.com.server.crt',
        mqttCaFile: 'mqtt.gushenxing.com.ca.crt',
        // express server
        expressHttpPort: 5001,
        resourcesPath: __dirname + '/' + 'resources'
    }
};

var env = process.env.NODE_ENV || 'development';

module.exports = function(){
    var returnVal = config[env];
    return returnVal;
};
