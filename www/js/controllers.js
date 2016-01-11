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

    .controller('HomeCtrl', function ($scope, $state, $timeout, $rootScope, $ionicPopup, Records, Account, DateUtil) {
        var currentUser;
        $scope.$on('$ionicView.beforeEnter', function() {
            currentUser = Parse.User.current();
            //console.log(currentUser);
            if (!currentUser) {
                return $state.go('signin');
            }
        });

        $scope.data = { fetalMoveTimes: 0, validCount: 0 };
        $scope.btnKickHtml = Account.getHtmlOnKickButton();
        $scope.btnKickStyle = $scope.btnKickHtml.length == 7 ? 'single-line-on-round-buton' : 'with-baby-name-on-round-button';
        $scope.today = new Date().toLocaleDateString();
        $scope.daysLeft = Account.daysLeft();

        // retrieve today's SweetKicks
        Records.findToday().then(function(result) {
            $timeout(function() {
                if (result) {
                    $scope.data.fetalMoveTimes = result.get('fetalMoveTimes');
                    $scope.data.validCount = result.get('validCount');
                }
            }, 1);
        });

        $scope.countKicks = function() {
//            var aKick = Records.get($scope.today) || {};
//            aKick.id = $scope.today;
//            aKick.actualKicks = $scope.actualKicks+1;
//            aKick.kickCount = $scope.kickCount;
            //Records.save(aKick);

            var date = new Date();
            var data = {
                localTimestamp: date.getTime(),
                localDate: date.toLocaleDateString(),
                localTime: date.toLocaleTimeString(),
                fetalMovement: $scope.data.fetalMovement,
                validCount: $scope.data.validCount,
                user: currentUser.id
            };
            //console.log(data);
//            Parse.Cloud.run('saveSweetKick', data).then(
//                function(res) {
//                    console.log(res);
//                },
//                function(err) {
//                    console.log(err);
//                }
//            );

            Records.saveToCloud().then(function(result) {
                $timeout(function() {
                    $scope.data.fetalMoveTimes = result.get('fetalMoveTimes');
                    $scope.data.validCount = result.get('validCount');
                }, 1);
            });

            //Records.save({'kickCount':$scope.kickCount+1, 'actualKicks':$scope.actualKicks+1});
//            $scope.kickCount = aKick.kickCount;
//            $scope.actualKicks = aKick.actualKicks;
        };

    })

    .controller('RecordsCtrl', function ($scope, Records, $http) {
        Records.findByDays().then(function(results) {
            console.log(results);
            $scope.records = results;
        });

//        $scope.refresh = function() {
//            $http.get('https://blazing-fire-4804.firebaseio.com/sweetkicks/records.json').then(function(resp) {
//                console.log('Success', resp);
//                var d = resp.data;
//                for (var k in d) {
//                    Records.directSave(d[k]);
//                }
//                $scope.records = Records.all();
//                // For JSON responses, resp.data contains the result
//            }, function(err) {
//                console.error('ERR', err);
//                // err.status will contain the status code
//            })
//        };
    })

    .controller('RecordDetailCtrl', function ($scope, $stateParams, Records) {
        $scope.strDate = $stateParams.strDate;
        $scope.actionTimes = Records.getFetalMoveTimesBySweetKickId($stateParams.recordId);
        console.log('action times', $scope.actionTimes);
    })

    .controller('AccountCtrl', function ($rootScope, $scope, $window, $cordovaDatePicker, Account, LocalStorage) {
        var INPUT_DUE_DATE = 'dueDate';
        var mySavedDate = LocalStorage.getInt(INPUT_DUE_DATE);
        var dateField = document.querySelector('#dueDate');
        var myDate = new Date();

        $scope.data = {};

        if (!isNaN(mySavedDate)) {
            myDate = new Date(mySavedDate);
            dateField.value = myDate.toLocaleDateString();
        }

        $scope.pickDate = function() {
            var options = {date: myDate, mode: 'date'};
            $cordovaDatePicker.show(options).then(function(date){
                var t = date.getTime();
                if (!isNaN(t)) {
                    LocalStorage.set(INPUT_DUE_DATE, t);
                    dateField.value = date.toLocaleDateString();
                    myDate = date;
                }
            });
        };

        $scope.babyName = Account.getBabyName();
        $scope.saveBabyName = function() {
            var name = document.querySelector('#babyName').value;
            if ( name!== $scope.babyName) {
                Account.saveBabyName(name);
            }
        };

        $scope.data.themes = Account.getThemes();
        $scope.data.selectedTheme = Account.getCurrentGlobalTheme();
        $scope.changeTheme = function() {
            Account.setCurrentGlobalTheme($scope.data.selectedTheme);
            $rootScope.currentSelectedTheme = Account.getCurrentGlobalTheme();
        };
    });


function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}