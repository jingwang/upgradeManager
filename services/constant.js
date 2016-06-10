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

    APP_RESOURCE_UPDATED: 'app:resource-updated',
    SOCKET_RESOURCE_UPDATED: 'socket:resource-updated',

    APP_PUBLISH_AVAILABLE_VERSIONS: 'app:publish_available_versions',

    APP_PUBLISH_LATEST_VERSION: 'app:publish-latest-version',

    APP_EVENT_LOG: 'app:event-log',

    EVENT_LOG_USER_CREATED: 'eventlog:user-created',
    EVENT_LOG_USER_UPDATED: 'eventlog:user-updated',
    EVENT_LOG_LOGGED_IN: 'eventlog:logged-in',
    EVENT_LOG_LOGGED_OFF: 'eventlog:logged-off',
    EVENT_LOG_SOFTWARE_DEPLOYED: 'eventlog:software-deployed',
    EVENT_LOG_GATEWAY_MODIFIED: 'eventlog:gateway-modified',

};


exports.TOPICS = {
    TOGATEWAY: 'TOGATEWAY',
    TOGATEWAY_UPGRADE: 'TOGATEWAY/UPGRADE',
    TOGATEWAY_LATEST_VERSION: 'TOGATEWAY/LATEST_VERSION',
    TOGATEWAY_DOWNLOAD_UPGRADE: 'TOGATEWAY/DOWNLOAD_UPGRADE',
    TOGATEWAY_AVAILABLE_VERSIONS: 'TOGATEWAY/AVAILABLE_VERSIONS',

    TOCLOUD: 'TOCLOUD',
    TOCLOUD_STATUS: 'TOCLOUD/STATUS',
    TOCLOUD_REQUEST_LATEST_VERSION: 'TOCLOUD/REQUEST_LATEST_VERSION',
    TOCLOUD_REQUEST_UPGRADE: 'TOCLOUD/REQUEST_UPGRADE',
    TOCLOUD_REQUEST_AVAILABLE_VERSIONS: 'TOCLOUD/REQUEST_AVAILABLE_VERSIONS'
};

exports.MESSAGE_STATUSES = {
    CONFIRMED: 'CONFIRMED', // received message from gateway
    PUBLISHED: 'PUBLISHED', // published message to gateway
    DELIVERED: 'DELIVERED' // confirmed message is delivered to gateway
};








