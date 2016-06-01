exports.EVENTS = {

    APP_GATEWAY_PINGED: 'app:gateway-pinged',
    APP_GATEWAY_UNPINGED: 'app:gateway-unpinged',

    APP_GATEWAY_ALIVE: 'app:gateway-alive',
    SOCKET_GATEWAY_ALIVE: 'socket:gateway-alive',

    APP_GATEWAY_DEAD: 'app:gateway-dead',
    SOCKET_GATEWAY_DEAD: 'socket:gateway-dead',

    APP_DEPLOY_SOFTWARE_UPGRADE: 'app:deploy-software-upgrade', // when user click upgrade button - will trigger publishing UPGRADE

    APP_SOFTWARE_UPGRADE_PUBLISHED: 'app:software-upgrade-published', // triggered when published
    SOCKET_SOFTWARE_UPGRADE_PUBLISHED: 'socket:software-upgrade-published',

    APP_SOFTWARE_UPGRADE_CONFIRMED: 'app:software-upgrade-confirmed', // triggered when confirmed (received STATUS)
    SOCKET_SOFTWARE_UPGRADE_CONFIRMED: 'socket:software-upgrade-confirmed',

    APP_RESOURCE_ADDED: 'app:resource-added',
    SOCKET_RESOURCE_ADDED: 'socket:resource-added',

    APP_EVENT_LOG: 'app:event-log',

    EVENT_LOG_USER_CREATED: 'eventlog:user-created',
    EVENT_LOG_USER_UPDATED: 'eventlog:user-updated',
    EVENT_LOG_LOGGED_IN: 'eventlog:logged-in',
    EVENT_LOG_LOGGED_OFF: 'eventlog:logged-off',
    EVENT_LOG_SOFTWARE_DEPLOYED: 'eventlog:software-deployed',
    EVENT_LOG_GATEWAY_MODIFIED: 'eventlog:gateway-modified',

};


exports.TOPICS = {

    UPGRADE: 'UPGRADE',
    STATUS: 'STATUS'
};

exports.MESSAGE_STATUSES = {
    CONFIRMED: 'CONFIRMED', // received message from gateway
    PUBLISHED: 'PUBLISHED', // published message to gateway
    DELIVERED: 'DELIVERED' // confirmed message is delivered to gateway
};








