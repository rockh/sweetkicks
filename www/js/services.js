angular.module('sweetkicks.services', [])

/**
 * A simple example service that returns some data.
 */
    .factory('Records', function (LocalStorage, DateUtil) {
        var FIVE_MINUTES = 300000;
        var records = [];
        var dateRegex = /(\d{4})-(\d{1,2})-(\d{1,2})/;  // 2014-09-21 or 2014-9-1

        return {
            all: function () {

                records.length = 0;
                for(var i= 0, len = LocalStorage.size(); i < len; i++) {
                    var key = localStorage.key(i);
                    console.log(key);
                    if (key.match(dateRegex)) {
                        records.push(LocalStorage.getObject(key))
                    }
                }
                return records;
            },
            get: function (recordId) {
                return LocalStorage.getObject(recordId);
            },
            save: function (aKick) {
                console.log(aKick);

                var lastKickTimestamp = aKick.updatedAt;
                var currentKickTimestamp = Date.now();
                if (!lastKickTimestamp || currentKickTimestamp - lastKickTimestamp >= FIVE_MINUTES) {

                    aKick.updatedAt = currentKickTimestamp;
                    ++aKick.kickCount;
                }

                LocalStorage.setObject(aKick.id, aKick);
            },
            directSave: function (aKick) {
                LocalStorage.setObject(aKick.id, aKick);
            }
        };
    })

    .factory('Settings', function (LocalStorage) {
        var KEY_DUE_DATE = 'dueDate';

        return {
            daysLeft: function() {
                var dueDate = LocalStorage.getInt(KEY_DUE_DATE);
                if (isNaN(dueDate)) {
                    return undefined;
                }

                var n = new Date().getTime();
                var days = Math.round((dueDate-n)/(1000*60*60*24));
                return days >= 0 ? days + ' days left' : 'DUE';
            }
        };
    });
