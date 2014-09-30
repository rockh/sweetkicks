// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('sweetkicks', ['ionic', 'sweetkicks.controllers', 'sweetkicks.utils'])

    .run(function ($ionicPlatform, $rootScope, Settings) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }

            // AdMob
            if (window.plugins && window.plugins.AdMob) {
                var admob_key = device.platform == "Android" ? "ca-app-pub-9997665567497408/4295329945" : "IOS_PUBLISHER_KEY";
                var admob = window.plugins.AdMob;
                admob.createBannerView(
                    {
                        'publisherId': admob_key,
                        'adSize': admob.AD_SIZE.BANNER,
                        'bannerAtTop': false
                    },
                    function () {
                        admob.requestAd(
                            { 'isTesting': false },
                            function () {
                                admob.showAd(true);
                            },
                            function () {
                                console.log('failed to request ad');
                            }
                        );
                    },
                    function () {
                        console.log('failed to create banner view');
                    }
                );
            }
        });

        // global settings: theme
        Settings.provision($rootScope);
    })

    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            // setup an abstract state for the tabs directive
            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html"
            })

            // Each tab has its own nav history stack:

            .state('tab.home', {
                url: '/home',
                views: {
                    'tab-home': {
                        templateUrl: 'templates/tab-home.html',
                        controller: 'HomeCtrl'
                    }
                }
            })

            .state('tab.records', {
                url: '/records',
                views: {
                    'tab-records': {
                        templateUrl: 'templates/tab-records.html',
                        controller: 'RecordsCtrl'
                    }
                }
            })
            .state('tab.record-detail', {
                url: '/record/:recordId',
                views: {
                    'tab-records': {
                        templateUrl: 'templates/record-detail.html',
                        controller: 'FriendDetailCtrl'
                    }
                }
            })

            .state('tab.settings', {
                url: '/settings',
                views: {
                    'tab-settings': {
                        templateUrl: 'templates/tab-settings.html',
                        controller: 'SettingsCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/home');
    });
