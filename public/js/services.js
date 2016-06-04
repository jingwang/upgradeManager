'use strict';

/* Services */
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function isInteger(n) {
    return parseInt(n) == n  && n > 0;
};

function isIntegerOrZero(n) {
    return parseInt(n) == n  && n >= 0;
};

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('upgradeManager.services', []).
  value('version', '0.1')


.factory('auth', function ($rootScope) {
    return {
        isLoggedInAsync: function(callback){
            var isLoggedIn = true;
            callback(isLoggedIn);
        }
    };
})

.factory('principal', ['$q', '$http', '$timeout',
    function($q, $http, $timeout) {
        var _identity = undefined,
            _authenticated = false;

        return {
            isIdentityResolved: function() {
                return angular.isDefined(_identity);
            },
            isAuthenticated: function() {
                return _authenticated;
            },
            isInRole: function(role) {
                if (!_authenticated || !_identity.roles) return false;

                return _identity.roles.indexOf(role) != -1;
            },
            isInAnyRole: function(roles) {
                if (!_authenticated || !_identity.roles) return false;

                for (var i = 0; i < roles.length; i++) {
                    if (this.isInRole(roles[i])) return true;
                }

                return false;
            },
            authenticate: function(identity) {
                _identity = identity;
                _authenticated = identity != null;

                // for this demo, we'll store the identity in localStorage. For you, it could be a cookie, sessionStorage, whatever
                if (identity) localStorage.setItem("demo.identity", angular.toJson(identity));
                else localStorage.removeItem("demo.identity");
            },
            identity: function(force) {
                var deferred = $q.defer();

                if (force === true) _identity = undefined;

                // check and see if we have retrieved the identity data from the server. if we have, reuse it by immediately resolving
                if (angular.isDefined(_identity)) {
                    deferred.resolve(_identity);

                    return deferred.promise;
                }

                // otherwise, retrieve the identity data from the server, update the identity object, and then resolve.
                //                   $http.get('/svc/account/identity', { ignoreErrors: true })
                //                        .success(function(data) {
                //                            _identity = data;
                //                            _authenticated = true;
                //                            deferred.resolve(_identity);
                //                        })
                //                        .error(function () {
                //                            _identity = null;
                //                            _authenticated = false;
                //                            deferred.resolve(_identity);
                //                        });

                // for the sake of the demo, we'll attempt to read the identity from localStorage. the example above might be a way if you use cookies or need to retrieve the latest identity from an api
                // i put it in a timeout to illustrate deferred resolution
                var self = this;
                $timeout(function() {
                    _identity = angular.fromJson(localStorage.getItem("demo.identity"));
                    self.authenticate(_identity);
                    deferred.resolve(_identity);
                }, 1000);

                return deferred.promise;
            }
        };
    }
])
// authorization service's purpose is to wrap up authorize functionality
// it basically just checks to see if the principal is authenticated and checks the root state
// to see if there is a state that needs to be authorized. if so, it does a role check.
// this is used by the state resolver to make sure when you refresh, hard navigate, or drop onto a
// route, the app resolves your identity before it does an authorize check. after that,
// authorize is called from $stateChangeStart to make sure the principal is allowed to change to
// the desired state
.factory('authorization', ['$rootScope', '$state', 'principal',
    function($rootScope, $state, principal) {
        return {
            authorize: function() {
                return principal.identity()
                    .then(function() {
                        var isAuthenticated = principal.isAuthenticated();

                        if ($rootScope.toState.data.roles && $rootScope.toState.data.roles.length > 0 && !principal.isInAnyRole($rootScope.toState.data.roles)) {
                            if (isAuthenticated) $state.go('accessdenied'); // user is signed in but not authorized for desired state
                            else {
                                // user is not authenticated. stow the state they wanted before you
                                // send them to the signin state, so you can return them when you're done
                                $rootScope.returnToState = $rootScope.toState;
                                $rootScope.returnToStateParams = $rootScope.toStateParams;

                                // now, send them to the signin state so they can log in
                                $state.go('signin');
                            }
                        }
                    });
            }
        };
    }
])



.factory('socket', function ($rootScope, $window) {
    var socket = io.connect();
    socket.on('disconnect', function () {
        console.log('socket disconnected');
//        $window.location = '/update/status.html';
    });
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
})

.factory('events', function ($rootScope) {
    return {
        gatewayAlive: 'socket:gateway-alive',
        gatewayDead: 'socket:gateway-dead',
        resourceAdded: 'socket:resource-added',
        resourceUpdated: 'socket:resource-updated',
        upgradePublished: 'socket:software-upgrade-published',
        upgradeConfirmed: 'socket:software-upgrade-confirmed',
        eventLogSoftwareDeployed: 'eventlog:software-deployed'
    }

})

.factory('constants', function ($rootScope) {
    return {
        USER_ROLE: {
            ADMIN: 'admin',
            USER: 'user'
        },
        STATUS: {
            PUBLISHED: 'PUBLISHED',
            CONFIRMED: 'CONFIRMED'
        }

    }
})

.factory('inputValidator', function ($rootScope) {
    var WARN_VALID_IP_KEY = 'validation.WARN_VALID_IP';
    var WARN_VALID_MAC_KEY = 'validation.WARN_VALID_MAC';
    var WARN_REQUIRED_KEY = 'validation.WARN_REQUIRED';
    var WARN_VALID_INTEGER_KEY = 'validation.WARN_VALID_INTEGER';
    var WARN_VALID_EMAIL_KEY = 'validation.WARN_VALID_EMAIL';
    return {

        validateEmail: function(data) {
            var pattern = new RegExp("[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$");
            if (!pattern.test(data.trim())) {

                return WARN_VALID_EMAIL_KEY;
            }
        },


        validateIp: function(data){

            var pattern = new RegExp("^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$");

            if (!pattern.test(data.trim())) {

                return WARN_VALID_IP_KEY;
            }
        },

        validateInteger: function(data, formVisible, dosChecked, dosEnabled){

            if((formVisible && dosChecked) || (formVisible && dosChecked == undefined && dosEnabled) ){
                if(!isInteger(data)){
                   return WARN_VALID_INTEGER_KEY;
                }
            }
        },


        validateMac: function(data) {
            if(data){
                var pattern = new RegExp("^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$");
                if (!pattern.test(data.trim())) {
                    return WARN_VALID_MAC_KEY;
                }
            }else{
                return WARN_VALID_MAC_KEY;
            }

        },


        validateRequired: function(data){
            if(!data){
                return WARN_REQUIRED_KEY;
            }
        }
    }

})


.factory('utility', function ($rootScope) {


    return {

        isNumber: function(n) {
            return isNumber(n);
        },
        isInteger: function(n) {
            return isInteger(n);
        },
        isIntegerOrZero: function(n) {
            return isIntegerOrZero(n);
        },
        uuid: function(){
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            };

            function guid() {
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            }
            return guid();
        },

        constructAioSensorStuId: function(stationDtuId, channelId) {
            return stationDtuId + '-AIO-' + channelId;
        },

        constructDioSensorStuId: function(stationDtuId, channelId) {
            return stationDtuId + '-DIO-' + channelId;
        },

        initGateway: function() {
            var gateway = {
                project_id: '',
                gatewayId: '', // unique integer, can be assigned by the app, will be used in communication
                serialNumber:'',
                name: 'New Gateway',
                address: '',
                latitude: '',
                longitude: ''
            };
            return gateway;
        },

        saveItem: function(key, value){
            localStorage.setItem(key, value);
        },
        retrieveItem: function(key){
            return localStorage.getItem(key);
        },

        removeItem: function(key){
            localStorage.removeItem(key);
        },
        clearAll: function(){
            localStorage.clear();
        }


    };
});
