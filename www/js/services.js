angular.module('sweetkicks.services', [])

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
            getObject: function (key, obj) {
                var o = JSON.parse($window.localStorage[key] || '{}');
                return Object.keys(o).length === 0 && obj ? obj : o;
            },
            getInt: function(k) {
                var v = this.get(k);
                return v && typeof v !== 'number' ? parseInt(v) : undefined;
            },
            getArray: function (key) {
                return JSON.parse($window.localStorage[key] || '[]');
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
    })

    .factory('Records', function (LocalStorage, DateUtil) {
        var FIVE_MINUTES = 300000;
        var dates = [];
        var records = [];
        var dateRegex = /(\d{4})-(\d{1,2})-(\d{1,2})/;  // 2014-09-21 or 2014-9-1

        return {
            getFetalMoveTimesBySweetKickId: function(id) {
                for (var i = 0; i < records.length; i++) {
                    var e = records[i];
                    if (e.id === id) {
                        return e.get('fetalMovedAt').map(function(date) {
                            return date.toLocaleTimeString();
                        });
                    }
                }
                return [];
            },
            findByDays: function() {
                if (records.length === 0) {
                    return this.findFromCloud(true).then(function(results) {
                        return results;
                    });
                } else {
                    return Parse.Promise.as(records);
                }
            },
            findToday: function() {
                if (records.length === 0) {
                    return this.findFromCloud(true).then(function(results) {
                        return results.length > 0 && results[0].createdAt.toDateString() === new Date().toDateString() ? results[0] : null;
                    });
                } else {
                    return Parse.Promise.as(records[0].createdAt.toDateString() === new Date().toDateString() ? records[0] : null);
                }
            },
            findFromCloud: function(fetchRemote) {
                if (!fetchRemote) {
                    return records;
                }

                var SweetKick = Parse.Object.extend('SweetKick');
                var query = new Parse.Query(SweetKick);
                query.equalTo('user', Parse.User.current());

                return query.find().then(
                    function(results) {
                        //console.log('Successfully found objects from cloud. Results =>', results);
                        records = results;
                        return records;
                    },
                    function(error) {
                        console.log('Error occurred whild find objects from cloud. Error =>', error);
                    }
                );
            },
            saveToCloud: function() {
                var SweetKick = Parse.Object.extend('SweetKick');
                var query = new Parse.Query(SweetKick);
                var today = new Date();

                var from = new Date();
                from.setHours(0, 0, 0, 0);
                var to = new Date(from);
                to.setDate(to.getDate() + 1);

                query.greaterThanOrEqualTo('fetalMovedAt', from);
                query.lessThan('fetalMovedAt', to);

                return query.first().then(
                    function(existingSK) {
                        if (existingSK) {
                            // update
                            existingSK.set('fetalMoveTimes', existingSK.get('fetalMoveTimes') + 1);
                            existingSK.get('fetalMovedAt').push(today);
                            if (today.getTime() - existingSK.get('countedAt') >= FIVE_MINUTES) {
                                existingSK.set('validCount', existingSK.get('validCount') + 1);
                                existingSK.set('countedAt', today.getTime());
                            }
                            return existingSK.save();
                        } else {
                            // create
                            var sk = new SweetKick();
                            var u = Parse.User.current();
                            sk.set('fetalMoveTimes', 1);
                            sk.set('validCount', 1);
                            sk.set('countedAt', today.getTime());
                            sk.set('fetalMovedAt', [today]);
                            sk.set('user', u);
                            sk.setACL(new Parse.ACL(u));
                            return sk.save();
                        }
                    },
                    function(error) {
                        console.log('Error occurred while saving SweetKick. Error: ' + error.code + " " + error.message);
                    }
                );
            },
            all: function () {
                //records.length = 0;
                console.log('records.length', records.length);
                if (records.length === 0 || records.length !== dates.length) {
                    records.length = 0;
                    dates.length = 0;
                    var validKicks = LocalStorage.getObject('valid_kicks');
                    if (validKicks.dates && validKicks.kicks) {
                        dates = validKicks.dates;
                        records = validKicks.kicks;
                    }
                }
                return records;
            },
            /**
             * Get a valid kick record object via date string.
             * @param strDate date string as id.
             * @returns ValidKick
             */
            get: function (strDate) {
                var dateIndex = dates.indexOf(strDate);
                if (dateIndex === -1) {
                    this.all();
                    dateIndex = dates.indexOf(strDate);
                }
                return dateIndex > -1 ? records[dateIndex] : {};
            },
            getKickLog: function(dateId) {
                return LocalStorage.getArray('kick_log_' + dateId);
            },
            save: function (aKick) {
                console.log(aKick);

                var lastKickTimestamp = aKick.updatedAt;
                var thisMoment = new Date(); // now
                var currentKickTimestamp = thisMoment.getTime();

                // log every single kick
                var KEY_KICK_LOG_DAY = 'kick_log_' + aKick.id;
                var log = LocalStorage.getArray(KEY_KICK_LOG_DAY);
                log.push({kick: log.length+1, time: thisMoment.toLocaleTimeString()});
                LocalStorage.setObject(KEY_KICK_LOG_DAY, log);

                if (!lastKickTimestamp || currentKickTimestamp - lastKickTimestamp >= FIVE_MINUTES) {
                    aKick.updatedAt = currentKickTimestamp;
                    ++aKick.kickCount;
                }

                var kickDateIndex = dates.indexOf(aKick.id);
                if (kickDateIndex === -1) {
                    dates.push(aKick.id);
                    records.push(aKick);
                } else {
                    dates.splice(kickDateIndex, 1);
                    dates.splice(kickDateIndex, 0, aKick.id);
                    records.splice(kickDateIndex, 1);
                    records.splice(kickDateIndex, 0, aKick);
                }
//                validKicks[aKick.id] = aKick;
//                records = .map(function(date) {
//                    return validKicks[date];
//                });
//                LocalStorage.setObject(aKick.id, aKick);
                LocalStorage.setObject('valid_kicks', {dates: dates, kicks: records});
            },
            directSave: function (aKick) {
                LocalStorage.setObject(aKick.id, aKick);
            }
        };
    })

    .factory('Account', function (LocalStorage) {
        var K_CURRENT_GLOBAL_THEME = 'current_global_theme';
        var KEY_DUE_DATE = 'dueDate';
        var KEY_BABY_NAME = 'babyName';
        //var themes = [{ label: 'Baby Blue', value: 'calm' }, { label: 'Baby Pink', value: 'assertive' }];
        var themes = { 'calm': 'Baby Blue', 'assertive': 'Baby Pink' };
        var self = {};

        self.getCurrentGlobalTheme = function () {
            return LocalStorage.get(K_CURRENT_GLOBAL_THEME, 'calm');
        };

        self.setCurrentGlobalTheme = function (theme) {
            LocalStorage.set(K_CURRENT_GLOBAL_THEME, theme);
        };

        self.daysLeft = function () {
            var dueDate = LocalStorage.getInt(KEY_DUE_DATE);
            if (isNaN(dueDate)) {
                return undefined;
            }

            var n = new Date().getTime();
            var days = Math.round((dueDate - n) / (1000 * 60 * 60 * 24));
            return days >= 0 ? days + ' days left' : 'DUE';
        };

        self.getHtmlOnKickButton = function () {
            var name = LocalStorage.get(KEY_BABY_NAME);
            return !name || name === 'undefined' ? 'KICK +1' : name + '<br/>KICK +1';
        };

        self.saveBabyName = function (name) {
            LocalStorage.set(KEY_BABY_NAME, name);
        };

        self.getBabyName = function () {
            return LocalStorage.get(KEY_BABY_NAME);
        };

        self.getThemes = function () {
            return themes;
        };

        self.theme = {
            bar: 'bar-' + self.getCurrentGlobalTheme()
        };

        return self;
    });