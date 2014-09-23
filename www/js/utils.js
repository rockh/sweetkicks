angular.module('sweetkicks.utils', [])

    .factory('LocalStorage', function ($window) {
        return {
            set: function (key, value) {
                $window.localStorage[key] = value;
            },
            get: function (key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            setObject: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key) {
                return JSON.parse($window.localStorage[key] || '{}');
            },
            getInt: function(k) {
                var v = this.get(k);
                return v && typeof v !== 'number' ? parseInt(v) : undefined;
            },
            size: function() {
                return $window.localStorage.length;
            }
        };
    })

    .factory('DateUtil', function() {
        return {
            today: function() {
                var d = new Date();
                return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
            },
            getDateTime: function(timestamp) {
                var d = new Date(timestamp);
                return d.toDateString();
            }
        };
    });
