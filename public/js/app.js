'use strict';
angular.module('upgradeManager',
    ['ngRoute', 'pascalprecht.translate', 'ui.router',
        'ui.bootstrap', 'xeditable',
        'ui.bootstrap.tpls', 'ui.map', 'chart.js',
        'ui.grid','ui.grid.resizeColumns', 'ui.grid.pagination',
        'ui.grid.selection', 'ui.grid.exporter', 'checklist-model', 'ui.bootstrap.showErrors',
        'xeditable', 'toggle-switch', 'nvd3', 'ngRadialGauge',
        'upgradeManager.controllers', 'upgradeManager.directives',
        'upgradeManager.services', 'ui.bootstrap.datetimepicker', 'remoteValidation', 'LocalStorageModule'])
.config(['$routeProvider', '$translateProvider',
    '$locationProvider', 'uiMapLoadParamsProvider',
    '$stateProvider', '$urlRouterProvider', 'localStorageServiceProvider',
    function($routeProvider, $translateProvider,
             $locationProvider, uiMapLoadParamsProvider,
             $stateProvider, $urlRouterProvider, localStorageServiceProvider) {
        if(window.history && window.history.pushState){
            $locationProvider.html5Mode(true);
        }
        localStorageServiceProvider.setPrefix('upgradeManager');

        $urlRouterProvider.otherwise("/default");

        $stateProvider
            .state('default', {
                url: "/",
                templateUrl: "partial/dashboard.ejs",
                controller: 'DashboardController',
                authenticate: true
            })

            .state('login', {
                url: "/login",
                controller: 'LoginController'
            })

            .state('dashboard', {
                url: "/dashboard",
                templateUrl: "partial/dashboard.ejs",
                controller: 'DashboardController',
                authenticate: true
            })


            .state('upgrade', {
                url: "/upgrade",
                templateUrl: "partial/upgrade.ejs",
                controller: 'UpgradeController',
                authenticate: true
            });

        uiMapLoadParamsProvider.setParams({
            v: '2.0',
            ak: 'BwkWVEfsahCUuRZWFdeEDT4V'// your map's develop key
        });

        $translateProvider.translations('en', {

            'DELIVERED': 'Delivered',
            'RECEIVED': 'Received',
            'PUBLISHED': 'Published',


            'login': {
                'login': 'Login',
                'username': 'Username',
                'password': 'Password',
                'pleaseLogin': 'Please Login',
                'loginFail': 'Login Failed'
            },

            'label': {

                'upgrade': 'Upgrade',
                'version': 'Version',
                'softwareUpgrade': 'Software Upgrade',
                'confirm': 'Confirm',
                'cancel': 'Cancel'
            },

            'navigation': {
                'dashboard': 'Dashboard',
                'upgrade': 'Software Upgrade',
                'userSetting': 'User Setting',
                'logout': 'Logout',
                'createUser': 'Create User',
                'userProfile': 'User Profile',
                'userManagement': 'User Management'
            },

            'user': {
                'username': 'Username',
                'password': 'Password',
                'company': 'Company',
                'namePrompt': 'Please enter your name',
                'usernamePrompt': 'Please enter the username',
                'passwordPrompt': 'Please enter the password',
                'confirmPassword': 'Confirm password',
                'role': 'Role',
                'admin': 'Admin',
                'user': 'User',
                'super': 'Super',
                'name': 'Name',
                'newPassword': 'New password ( only if reset )',
                'confirmNewPassword': 'Confirm new password'
            },
            'validation': {
                'WARN_VALID_IP': 'Please enter a valid IP address',
                'WARN_REQUIRED': 'Required',
                'WARN_VALID_INTEGER': 'Please enter an integer greater than zero',
                'CREATE_USER_SUCCESS': 'New user created successfully',
                'CREATE_USER_FAIL': 'Failed to create new user, please try again later',
                'CHANGE_PASSWORD_SUCCESS': 'Password reset successfully',
                'CHANGE_PASSWORD_FAIL': 'Failed to reset password, please try again later',
                'UPDATE_USER_SUCCESS': 'User profile updated successfully',
                'UPDATE_USER_FAIL': 'Failed to update user profile, please try again later',
                'UPDATE_USERS_SUCCESS': 'User profiles updated successfully',
                'UPDATE_USERS_FAIL': 'Failed to update user profiles, please try again later',
                'USERNAME_EXISTS': 'Username is taken',
                'PASSWORD_INVALID': 'Password is at minimum 8-digit, only including numbers or characters, with at least 1 number and at least 1 character',
                'PASSWORD_NOTMATCH': 'Passwords do not match',
                'USERNAME_INVALID': 'Username must be a valid email address',
                'USERNAME_DUPLICATE': 'Username is taken',
                'FIELD_REQUIRED': 'Both username and password are required',

            }

        });

        $translateProvider.preferredLanguage('en');
        $translateProvider.useSanitizeValueStrategy('escapeParameters');

}])

.run(function($rootScope, $location, auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
        auth.isLoggedInAsync(function(loggedIn) {
            if (toState.authenticate && !loggedIn) {
                $rootScope.returnToState = toState.url;
                //$rootScope.returnToStateParams = toParams.Id;
                $location.path('/login');
                if(!$rootScope.$$phase) $rootScope.$apply()
            }
        });
    });
});
