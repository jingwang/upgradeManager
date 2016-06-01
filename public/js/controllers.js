/** UTILITY FUNCTIONS **/
var openCreateUserModalCore = function (http, log, uibModal) {

    var modalInstance = uibModal.open({
        animation: true,
        templateUrl: 'CreateUserModal.html',
        controller: 'CreateUserModalInstanceController',
        size: 'md'
    });

    modalInstance.result.then(function () {

    }, function () {
        log.info('Modal dismissed at: ' + new Date());
    });
};

var openUserManagementModalCore = function (http, log, uibModal) {

    var modalInstance = uibModal.open({
        animation: true,
        templateUrl: 'UserManagementModal.html',
        controller: 'UserManagementModalInstanceController',
        size: 'md'
    });

    modalInstance.result.then(function () {

    }, function () {
        log.info('Modal dismissed at: ' + new Date());
    });
};


var openUserProfileModalCore = function (http, log, uibModal, user) {

    //console.log(user);
    var modalInstance = uibModal.open({
        animation: true,
        templateUrl: 'UserProfileModal.html',
        controller: 'UserProfileModalInstanceController',
        size: 'md',
        resolve: {
            user: function () {
                return user;
            }
        }
    });

    modalInstance.result.then(function () {

    }, function () {
        log.info('Modal dismissed at: ' + new Date());
    });
};

var openSoftwareUpgradeModalCore = function (http, log, uibModal, gateway) {
    var modalInstance = uibModal.open({
        animation: true,
        templateUrl: 'SoftwareUpgradeModal.html',
        controller: 'SoftwareUpgradeModalInstanceController',
        size: 'md',
        resolve: {
            gateway: function () {
                return gateway;
            }
        }
    });

    modalInstance.result.then(function () {

    }, function () {
        log.info('Modal dismissed at: ' + new Date());
    });
};


/** CONTROLLERS **/

angular.module('upgradeManager.controllers', [])

.controller('UserProfileModalInstanceController', function ($http, $scope, $uibModalInstance, user) {

        $scope.user = user;
        $scope.updated = false;
        $scope.err = false;
        console.log('user: ');
        console.log($scope.user);

        $scope.ok = function () {
            // create user
            $http({method: 'POST', url: '/api/user/update', data: $scope.user}).
            success(function(data, status, headers, config) {

                if(data.data){
                    $scope.err = false;
                    $scope.user = data.data;
                    $scope.updated = true;

                } else if(data.error){
                    $scope.updated = false;
                    $scope.err = true;
                }


            }).
            error(function(data, status, headers, config) {
                $scope.updated = false;
                $scope.err = true;

            });

        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    })

.controller('CreateUserModalInstanceController', function ($http, $scope, $uibModalInstance, constants) {

    $scope.created = {};
    $scope.err = false;

    var initNewUser = function() {
        return {
            username: '',
            password: '',
            role: 'user'
        };
    };

    $scope.newUser = initNewUser();

    $scope.roleOptions = [constants.USER_ROLE.USER, constants.USER_ROLE.ADMIN];

    $scope.ok = function () {
        // create user
        $http({method: 'POST', url: '/api/user', data: $scope.newUser}).
        success(function(data, status, headers, config) {

            if(data.data){
                $scope.err = false;
                $scope.newUser = initNewUser();
                $scope.created = data.data;
                console.log($scope.created);
            } else if(data.error){
                $scope.created = {};
                $scope.err = true;
            }


        }).
        error(function(data, status, headers, config) {
            $scope.created = {};
            $scope.err = true;

        });

    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
})

.controller('UserManagementModalInstanceController', function ($http, $scope, $uibModalInstance, constants) {

    $scope.err = false;
    $scope.updated = false;
    $http({method: 'GET', url: '/api/user'}).
    success(function(data, status, headers, config) {

        $scope.users = data.data
        console.log($scope.users);

    }).
    error(function(data, status, headers, config) {
        $scope.users = [];

    });

    $scope.roleOptions = [constants.USER_ROLE.USER, constants.USER_ROLE.ADMIN];

    $scope.ok = function () {

        // create user
        $http({method: 'POST', url: '/api/users/update', data: $scope.users}).
        success(function(data, status, headers, config) {
            $scope.err = false;
            $scope.updated = true;
            $scope.users = data.data;
            console.log($scope.users);

        }).
        error(function(data, status, headers, config) {
            $scope.err = true;
            $scope.updated = false;
        });

    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
})

.controller('SoftwareUpgradeModalInstanceController', function ($http, $scope, $uibModalInstance, gateway) {
    $scope.gateway = gateway;
    $scope.ok = function () {
        $http({method: 'POST', url: '/api/gatewaySoftwareUpgrade', data: {
            gatewayIds: [$scope.gateway.gatewayId],
            softwareVersion: $scope.gateway.newVersion
        }}).
        success(function(data, status, headers, config) {
            $uibModalInstance.close();

        }).
        error(function(data, status, headers, config) {
            $uibModalInstance.close();
        });

    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
})

.controller('LoginController', ['$rootScope', '$scope', '$http', 'events', 'socket', '$location', '$log',
    function ($rootScope, $scope, $http, events, socket, $location, $log) {
    console.log('in login controller');

}])

.controller('AppController', ['$rootScope', '$scope', '$http', 'events', 'socket', '$location', '$log', '$uibModal', 'localStorageService',
    function ($rootScope, $scope, $http, events, socket, $location, $log, $uibModal, localStorageService) {
        $scope.username = window.username;

        $http({cache: true, method: 'GET', url: '/api/user/' + $scope.username}).
        success(function(data, status, headers, config) {
            $scope.user = data.data;
            //console.log($scope.user);
        }).
        error(function(data, status, headers, config) {

        });

        $scope.openCreateUserModal = function () {
            openCreateUserModalCore($http, $log, $uibModal);
        };

        $scope.openUserProfileModal = function () {
            openUserProfileModalCore($http, $log, $uibModal, $scope.user);
        };

        $scope.openUserManagementModal = function() {
            openUserManagementModalCore($http, $log, $uibModal);
        };

        $http({cache: true, method: 'GET', url: '/api/isAuthorized/dashboard'}).
        success(function(data, status, headers, config) {
            var isAuthorized = data;
            $scope.showDashboard = isAuthorized;
        }).
        error(function(data, status, headers, config) {

        });


        $http({cache: true, method: 'GET', url: '/api/isAuthorized/upgrade'}).
        success(function(data, status, headers, config) {
            var isAuthorized = data;
            $scope.showUpgrade = isAuthorized;
        }).
        error(function(data, status, headers, config) {

        });

        $scope.isMenuActive = function (viewLocation) {
            return $location.path().slice(0, viewLocation.length) == viewLocation;
        };

}])

.controller('DashboardController', ['$rootScope', '$scope', '$http',
    'editableOptions', 'editableThemes','utility', '$translate',
    '$stateParams', 'events','socket', 'constants', 'localStorageService', '$log', '$uibModal',
    function ($rootScope, $scope, $http, editableOptions,
              editableThemes, utility, $translate, $stateParams,
              events, socket, constants, localStorageService, $log, $uibModal) {
        console.log('Dashboard controller');

}])

.controller('UpgradeController', ['$rootScope', '$scope', '$http',
    'editableOptions', 'editableThemes','utility', '$translate',
    '$stateParams', 'events','socket', 'constants', 'localStorageService', '$log', '$uibModal',
    function ($rootScope, $scope, $http, editableOptions,
              editableThemes, utility, $translate, $stateParams,
              events, socket, constants, localStorageService, $log, $uibModal) {

        socket.on(events.gatewayAlive, function (gatewayId) {
            for(var i = 0; i < $scope.gateways.length; i++){
                var gateway = $scope.gateways[i];
                if(gatewayId == gateway.gatewayId){
                    gateway.alive = true;
                    localStorageService.set(gatewayId, true);
                }
            }

        });

        socket.on(events.gatewayDead, function (gatewayId) {
            for(var i = 0; i < $scope.gateways.length; i++){
                var gateway = $scope.gateways[i];
                if(gatewayId == gateway.gatewayId){
                    gateway.alive = false;
                    localStorageService.set(gatewayId, false);
                }
            }
        });

        socket.on(events.resourceAdded, function (file) {
            for(var i = 0; i < $scope.gateways.length; i++){
                var gateway = $scope.gateways[i];
                if(parseFloat(file) > parseFloat(gateway.gatewaySoftwareUpgrade.softwareVersion)){
                    gateway.newVersion = file;
                }
            }
        });

        socket.on(events.upgradePublished, function (obj) {
            console.log('published');
            var gatewayId = obj.gatewayId;
            var softwareVersion = obj.softwareVersion;

            for(var i = 0; i < $scope.gateways.length; i++){
                var gateway = $scope.gateways[i];
                if(gateway.gatewayId == gatewayId){
                    gateway.gatewaySoftwareUpgrade.softwareVersion = softwareVersion;
                    gateway.gatewaySoftwareUpgrade.status = constants.STATUS.PUBLISHED;
                    if(gateway.newVersion == softwareVersion) {
                        gateway.newVersion = undefined;
                    }
                    refreshEventLog(gateway);
                    break;
                }
            }
            console.log($scope.gateways);
        });

        socket.on(events.upgradeConfirmed, function (obj) {
            console.log('confirmed');
            var gatewayId = obj.gatewayId;
            var softwareVersion = obj.softwareVersion;

            for(var i = 0; i < $scope.gateways.length; i++){
                var gateway = $scope.gateways[i];
                if(gateway.gatewayId == gatewayId){
                    gateway.gatewaySoftwareUpgrade.softwareVersion = softwareVersion;
                    gateway.gatewaySoftwareUpgrade.status = constants.STATUS.CONFIRMED;
                    if(gateway.newVersion == softwareVersion) {
                        gateway.newVersion = undefined;
                    }
                    refreshEventLog(gateway);
                    break;
                }
            }
            console.log($scope.gateways);
        });

        $scope.openSoftwareUpgradeModal = function (gateway) {
            openSoftwareUpgradeModalCore($http, $log, $uibModal, gateway);
        };

        var refreshEventLog = function(gateway){
            $http({method: 'GET', url: '/api/eventLog?gatewayId=' + gateway.gatewayId + '&event=' + events.eventLogSoftwareDeployed}).
            success(function(logData, status, headers, config) {
                console.log(logData);
                gateway.logs = logData.data;


            }).
            error(function(data, status, headers, config) {

            });
        };

        var loadSoftwareUpgradeForGateway = function(gateway, files) {
            // load associated deviceConfig and sensors
            $http({method: 'GET', url: '/api/gatewaySoftwareUpgrade/gatewayId/' + gateway.gatewayId}).
            success(function(data, status, headers, config) {
                gateway.gatewaySoftwareUpgrade = data.data;
                if(files){
                    for(var j = 0; j < files.length; j++){
                        var file = files[j];
                        if(parseFloat(file) > parseFloat(gateway.gatewaySoftwareUpgrade.softwareVersion)){
                            gateway.newVersion = file;
                            break;
                        }
                    }
                }
                refreshEventLog(gateway);

            }).
            error(function(data, status, headers, config) {

            });
        };


        // load resources
        $http({method: 'GET', url: '/api/resources'}).
        success(function(data, status, headers, config) {
            // files is sorted desc
            var files = data.data;
            console.log(files);
            // load gateways
            $http({method: 'GET', url: '/api/gateway'}).
            success(function(data, status, headers, config) {
                $scope.gateways = data.data;
                for(var i = 0; i < $scope.gateways.length; i++){
                    var gw = $scope.gateways[i];
                    gw.alive = localStorageService.get(gw.gatewayId);
                    loadSoftwareUpgradeForGateway(gw, files);
                }
            }).
            error(function(data, status, headers, config) {

            });
        }).
        error(function(data, status, headers, config) {

        });

}])
;

