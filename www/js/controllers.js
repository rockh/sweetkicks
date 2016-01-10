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
        var currentUser = Parse.User.current();
        if (!currentUser) {
            return $state.go('signin');
        }

        $scope.btnKickHtml = Account.getHtmlOnKickButton();
        $scope.btnKickStyle = $scope.btnKickHtml.length == 7 ? 'single-line-on-round-buton' : 'with-baby-name-on-round-button';
        $scope.today = DateUtil.today();
        $scope.daysLeft = Account.daysLeft();
        $scope.record = Records.get($scope.today);
        $scope.records = Records.all();

        $scope.kickCount = !$scope.record.hasOwnProperty('id') ? 0 : $scope.record.kickCount;
        $scope.actualKicks = !$scope.record.hasOwnProperty('id') ? 0 : $scope.record.actualKicks;

        $scope.countKicks = function() {
            var aKick = Records.get($scope.today) || {};
            aKick.id = $scope.today;
            aKick.actualKicks = $scope.actualKicks+1;
            aKick.kickCount = $scope.kickCount;
            Records.save(aKick);

            //Records.save({'kickCount':$scope.kickCount+1, 'actualKicks':$scope.actualKicks+1});
            $scope.kickCount = aKick.kickCount;
            $scope.actualKicks = aKick.actualKicks;
        };

    })

    .controller('RecordsCtrl', function ($scope, Records, $http) {
        $scope.records = Records.all();

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
        $scope.strDate = $stateParams.recordId;
        $scope.kickLog = Records.getKickLog($stateParams.recordId);
        console.log('kick log', $scope.kickLog);
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