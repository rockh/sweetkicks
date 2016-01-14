angular.module('sweetkicks.controllers', ['sweetkicks.services', 'ngCordova'])

    .controller('SignInCtrl', function ($scope, $rootScope, $state, $ionicPopup, $ionicHistory) {
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });

        $scope.data = { user: { email: {} } };
        $scope.validateUser = function() {
            if (!validateEmail($scope.data.user.email.text)) {
                $scope.data.user.email.text = undefined;
                $scope.data.user.email.invalid = true;
                return false;
            }

            delete $scope.data.user.email.invalid;
            console.log('yes, valid email =>', $scope.data.user.email);

            signInUser();
        };

        function signInUser() {
            var emailText = $scope.data.user.email.text;
            Parse.User.logIn(emailText, emailText, {
                success: function(user) {
                    console.log('Parse user =>', user);
                    $state.go('tab.home');
                },
                error: function(user, error) {
                    console.log("Error: " + error.code + " " + error.message);
                    $ionicPopup.alert({
                        title: 'Failed',
                        okType: 'button-' + $rootScope.currentSelectedTheme,
                        template: '<p class="text-center">' + (error.code === 101 ? 'Invalid account' : error.message) + '</p>'
                    });
                }
            });
        }
    })

    .controller('SignUpCtrl', function ($scope, $rootScope, $state, $ionicPopup, $ionicHistory) {
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });

        $scope.data = { user: { email: {} } };
        $scope.validateUser = function() {
            if (!validateEmail($scope.data.user.email.text)) {
                $scope.data.user.email.text = undefined;
                $scope.data.user.email.invalid = true;
                return false;
            }

            delete $scope.data.user.email.invalid;
            console.log('yes, valid email =>', $scope.data.user.email);

            createUser();
        };

        function createUser() {
            var emailText = $scope.data.user.email.text;
            var user = new Parse.User();
            user.set("email", emailText);
            user.set("username", emailText);
            user.set("password", emailText);
            user.signUp(null, {
                success: function (user) {
                    console.log('Parse user =>', user);
                    $state.go('tab.home');
                },
                error: function (user, error) {
                    // Show the error message somewhere and let the user try again.
                    console.log("Error: " + error.code + " " + error.message);
                    $ionicPopup.alert({
                        title: 'Failed',
                        okType: 'button-' + $rootScope.currentSelectedTheme,
                        template: '<p class="text-center">' + error.message + '</p>'
                    });
                }
            });
        }
    })

    .controller('HomeCtrl', function ($scope, $state, $timeout, $rootScope, $ionicPopup, $cordovaDialogs, Records, Account) {
        var currentUser;
        $scope.$on('$ionicView.beforeEnter', function() {
            currentUser = Parse.User.current();
            //console.log(currentUser);
            if (!currentUser) {
                return $state.go('signin');
            }
        });

        $scope.data = { fetalMoveTimes: 0, validCount: 0 };
        $scope.btnKickHtml = !Account.getOptions().babyName ? 'KICK +1' : Account.getOptions().babyName + '<br/>KICK +1';
        $scope.btnKickStyle = $scope.btnKickHtml.length == 7 ? 'single-line-on-round-buton' : 'with-baby-name-on-round-button';
        $scope.today = new Date().toLocaleDateString();
        $scope.daysToDueDate = Account.getDaysToDueDate();

        // retrieve today's SweetKicks
        Records.findToday().then(function(result) {
            $scope.dataReady = false;
            $timeout(function() {
                if (result) {
                    $scope.data.fetalMoveTimes = result.get('fetalMoveTimes');
                    $scope.data.validCount = result.get('validCount');
                }
                $scope.dataReady = true;
            }, 1);
        });

        // on click "KICK +1" button
        $scope.countKicks = function() {
            $scope.dataReady = false;
            Records.saveToCloud().then(function(result) {
                $timeout(function() {
                    $scope.data.fetalMoveTimes = result.get('fetalMoveTimes');
                    $scope.data.validCount = result.get('validCount');
                    $scope.dataReady = true;
                    if ($scope.data.validCount > 0 && $scope.data.validCount % 10 === 0 ) {
                        $cordovaDialogs
                        .alert('Hey, the little one\'s kicking reaches ' + $scope.data.validCount + ' times!', 'Remind', 'OK')
                        .then(function() {
                            if(AdMob) {
                                AdMob.showInterstitial();
                            }
                        });
                    }
                }, 1);
            });
        };

    })

    .controller('RecordsCtrl', function ($scope, Records, $http) {
        Records.findByDays().then(function(results) {
            console.log(results);
            $scope.records = results;
        });
    })

    .controller('RecordDetailCtrl', function ($scope, $stateParams, Records) {
        $scope.strDate = $stateParams.strDate;
        $scope.actionTimes = Records.getFetalMoveTimesBySweetKickId($stateParams.recordId);
        console.log('action times', $scope.actionTimes);
    })

    .controller('AccountCtrl', function ($rootScope, $state, $scope, $window, $cordovaDatePicker, Account) {
        $scope.settings = Account.getOptions();

        $scope.pickDate = function() {
            var options = {date: $scope.settings.dueDate || new Date(), mode: 'date'};
            $cordovaDatePicker.show(options).then(function(selectedDate){
                $scope.settings.dueDate = selectedDate;
            });
        };

        $scope.appThemes = { 'calm': 'Baby Blue', 'assertive': 'Baby Pink' };
        $scope.changeTheme = function() {
            $rootScope.currentSelectedTheme = $scope.settings.selectedTheme;
        };

        $scope.$watchGroup(['settings.dueDate', 'settings.babyName', 'settings.selectedTheme'], function(newVal, oldVal) {
            console.log('new', newVal[0], 'old', oldVal[0]);
            if (newVal[0] && (!oldVal[0] || (oldVal[0] && newVal[0].toDateString() !== oldVal[0].toDateString()))) {
                Account.setOption('dueDate', newVal[0]);
            }
            if (newVal[1] !== oldVal[1]) {
                Account.setOption('babyName', newVal[1]);
            }
            if (newVal[2] !== oldVal[2]) {
                Account.setOption('selectedTheme', newVal[2]);
            }
        });

        $scope.$on('$ionicView.beforeLeave', function() {
            console.log('$ionicView.beforeLeave');
            Account.setOptions();
        });
    });


function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}