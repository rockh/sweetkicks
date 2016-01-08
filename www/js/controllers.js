angular.module('sweetkicks.controllers', ['sweetkicks.services'])

    .controller('HomeCtrl', function ($scope, $timeout, $rootScope, Records, Settings, DateUtil) {

        $scope.btnKickHtml = Settings.getHtmlOnKickButton();
        $scope.btnKickStyle = $scope.btnKickHtml.length == 7 ? 'single-line-on-round-buton' : 'with-baby-name-on-round-button';
        $scope.today = DateUtil.today();
        $scope.daysLeft = Settings.daysLeft();
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

    .controller('RecordDetailCtrl', function ($scope, $stateParams, Records) {
//        $scope.record = Records.get($stateParams.recordId);
//        $scope.lastKickTime = new Date($scope.record.updatedAt).toLocaleString();
        $scope.strDate = $stateParams.recordId;
        $scope.kickLog = Records.getKickLog($stateParams.recordId);
        console.log('kick log', $scope.kickLog);
    })

    .controller('SettingsCtrl', function ($rootScope, $scope, $window, Settings, LocalStorage) {
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
            $window.plugins.datePicker.show({date: myDate, mode: 'date'}, function(date){
                var t = date.getTime();
                if (!isNaN(t)) {
                    LocalStorage.set(INPUT_DUE_DATE, t);
                    dateField.value = date.toLocaleDateString();
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

        $scope.data.themes = Settings.getThemes();
        $scope.data.selectedTheme = Settings.getCurrentGlobalTheme();
        $scope.changeTheme = function() {
            Settings.setCurrentGlobalTheme($scope.data.selectedTheme);
            $rootScope.currentSelectedTheme = Settings.getCurrentGlobalTheme();
        };
    });
