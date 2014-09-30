angular.module('sweetkicks.controllers', ['sweetkicks.services'])

    .controller('HomeCtrl', function ($scope, $timeout, Records, Settings, DateUtil) {
        var m = 59, s = 60;
        var promise;
        var pre0 = function(x) {
            return x < 10 ? '0' + x : x;
        };

        $scope.btnKickHtml = Settings.getHtmlOnKickButton();
        $scope.btnKickStyle = $scope.btnKickHtml.length == 7 ? 'single-line-on-round-buton' : 'with-baby-name-on-round-button';
        $scope.today = DateUtil.today();
        $scope.daysLeft = Settings.daysLeft();
        $scope.record = Records.get($scope.today);

        $scope.kickCount = !$scope.record.hasOwnProperty('id') ? 0 : $scope.record.kickCount;
        $scope.actualKicks = !$scope.record.hasOwnProperty('id') ? 0 : $scope.record.actualKicks;
//        $scope.oneHourCount = "01:00:00";
//        $scope.startTimer = false;
//        $scope.startSession = function () {
//            $scope.startTimer = true;
//
//            if (59 == m && 60 == s) {
//                s--;
//                promise = $timeout($scope.startSession, 1000);
//            } else if (0 == m && 0 == s) {
//                $scope.oneHourCount = '00:00:00';
//                $scope.stop();
//                alert('1 hour kicks count done!');
//            } else {
//                if (s > 0) {
//                    $scope.oneHourCount = '00:' + pre0(m) + ':' + pre0(s);
//                    s--;
//                } else if (s == 0) {
//                    $scope.oneHourCount = '00:' + pre0(m) + ':' + pre0(s);
//                    m--; s = 59;
//                }
//                promise = $timeout($scope.startSession, 1000);
//            }
//        };

//        $scope.stop = function () {
//            $timeout.cancel(promise);
//        };

        $scope.countKicks = function() {
            var aKick = Records.get($scope.today) || {};
            aKick.id = $scope.today;
            aKick.actualKicks = $scope.actualKicks+1;
            aKick.kickCount = $scope.kickCount;
            Records.save(aKick);

            //Records.save({'kickCount':$scope.kickCount+1, 'actualKicks':$scope.actualKicks+1});
            $scope.kickCount = aKick.kickCount;
            $scope.actualKicks = aKick.actualKicks;

//            $scope.record = Records.get
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

    .controller('FriendDetailCtrl', function ($scope, $stateParams, Records) {
        $scope.record = Records.get($stateParams.recordId);
        $scope.lastKickTime = new Date($scope.record.updatedAt).toLocaleString();
    })

    .controller('SettingsCtrl', function ($rootScope, $scope, $window, Settings, LocalStorage) {
        var INPUT_DUE_DATE = 'dueDate';
        var mySavedDate = LocalStorage.getInt(INPUT_DUE_DATE);
        var dateField = document.querySelector('#dueDate');


        var myDate = new Date();

        if (!isNaN(mySavedDate)) {
            myDate = new Date(mySavedDate);
            dateField.value = myDate.toLocaleDateString();
        }

        $scope.pickDate = function() {
            $window.plugins.datePicker.show({date: myDate, mode: 'date'}, function(date){
                var t = date.getTime();
                if (!isNaN(t)) {
                    LocalStorage.set(INPUT_DUE_DATE, t);
                    dateField.value = date.toLocaleDateString()
                    myDate = date;
                }
            });
        };

        $scope.babyName = Settings.getBabyName();
        $scope.saveBabyName = function() {
            var name = document.querySelector('#babyName').value;
            if ( name!== $scope.babyName) {
                Settings.saveBabyName(name);
            }
        };

        $scope.themes = Settings.getThemes();
        $scope.myTheme = $scope.themes[Settings.getThemeId()];
        $scope.onThemeChange = function() {
            Settings.setThemeId(document.querySelector('#myTheme').value);
            Settings.provision($rootScope);
        };
    });