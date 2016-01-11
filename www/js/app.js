// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('sweetkicks', ['ionic', 'sweetkicks.controllers'])

    .run(function ($ionicPlatform, $rootScope, Account) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

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

        $ionicPlatform.registerBackButtonAction(function (event) {
            event.preventDefault();
            ionic.Platform.exitApp();
        }, 100);

        $rootScope.currentSelectedTheme = Account.getCurrentGlobalTheme();
        $rootScope.$watch('currentSelectedTheme', function(newVal, oldVal) {
        // Add this code for updating bar theme. It requires to refactor once ion-nav-bar does work properly with ng-class in next version.
            var oldBarTheme = 'bar-' + oldVal;
            var newBarTheme = 'bar-' + newVal;

            // We need to be able to add a class the cached nav-bar
            // Which provides the background color
            var cachedNavBar = document.querySelector('.nav-bar-block[nav-bar="cached"]');
            var cachedHeaderBar = cachedNavBar.querySelector('.bar-header');

            // And also the active nav-bar
            // which provides the right class for the title
            var activeNavBar = document.querySelector('.nav-bar-block[nav-bar="active"]');
            var activeHeaderBar = activeNavBar.querySelector('.bar-header');

            cachedHeaderBar.classList.remove(oldBarTheme);
            activeHeaderBar.classList.remove(oldBarTheme);
            activeHeaderBar.classList.add(newBarTheme);
            cachedHeaderBar.classList.add(newBarTheme);
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        // Parse initialising
        Parse.initialize("DUhmhs2DlPOk73TF5yZag44kdI9EyaqWgFE8lFJS", "3HniVtTcGXrFMayo9N2HxUGStjV1GPUrcJYK43Zu");

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            .state('signin', {
                url: '/signin',
                templateUrl: 'templates/signin.html',
                controller: 'SignInCtrl'
            })

            .state('signup', {
                url: '/signup',
                templateUrl: 'templates/signup.html',
                controller: 'SignUpCtrl'
            })

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
                url: '/record/:recordId/:strDate',
                views: {
                    'tab-records': {
                        templateUrl: 'templates/record-detail.html',
                        controller: 'RecordDetailCtrl'
                    }
                }
            })

            .state('tab.account', {
                url: '/account',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/tab-account.html',
                        controller: 'AccountCtrl'
                    }
                }
            });


        $urlRouterProvider.otherwise(function($injector, $location) {
            var state = $injector.get('$state');
            var currentUser = Parse.User.current();
            if (currentUser) {
                state.go('tab.home');
            } else {
                state.go('signin');
            }
        });
    });