(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

require('./scripts/app.js');
require('./scripts/list/list.module.js');
require('./scripts/list/list.display.js');
require('./scripts/list/list.create.js');
require('./scripts/models/Abstract.js');
require('./scripts/models/Listes.js');
require('./scripts/services/DreamFactoryBeta.js');
},{"./scripts/app.js":2,"./scripts/list/list.create.js":3,"./scripts/list/list.display.js":4,"./scripts/list/list.module.js":5,"./scripts/models/Abstract.js":6,"./scripts/models/Listes.js":7,"./scripts/services/DreamFactoryBeta.js":8}],2:[function(require,module,exports){
String.prototype.sansAccent = function(){
    var accent = [
        /[\300-\306]/g, /[\340-\346]/g, // A, a
        /[\310-\313]/g, /[\350-\353]/g, // E, e
        /[\314-\317]/g, /[\354-\357]/g, // I, i
        /[\322-\330]/g, /[\362-\370]/g, // O, o
        /[\331-\334]/g, /[\371-\374]/g, // U, u
        /[\321]/g, /[\361]/g, // N, n
        /[\307]/g, /[\347]/g, // C, c
    ];
    var noaccent = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];

    var str = this;
    for(var i = 0; i < accent.length; i++){
        str = str.replace(accent[i], noaccent[i]);
    }

    return str;
};

if (typeof console == 'undefined') {
    console = {};
    console.log = function (message) {
        alert(message);
    };
    console.warn = function (message) {
        alert(message);
    };
    console.error = function (message) {
        alert(message);
    };
    console.trace = function () {
        alert('trace');
    };
}

function hideAddressBar()
{
  if(!window.location.hash)
  {
      if(document.height < window.outerHeight)
      {
          document.body.style.height = (window.outerHeight + 50) + 'px';
      }
 
      setTimeout( function(){ window.scrollTo(0, 1); }, 50 );
  }
}
 
window.addEventListener("load", function(){ if(!window.pageYOffset){ hideAddressBar(); } } );
window.addEventListener("orientationchange", hideAddressBar );


(function() {
    var app = angular.module('listApp', ['listModule']);

    app.controller('AppController', [
        function() {
           
        }
    ]);

    app.directive('ngFocus', function() {
        return function(scope, element, attrs) {
           scope.$watch(attrs.ngFocus,
             function (newValue) {
                newValue && element[0].focus();
             },true);
          };
    });

    /**
     * Directive flat-checkbox
     * Usage:
     * <input flat-checkbox>
     *   ...
     * </input>
     */
    app.directive('flatCheckbox', [function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $(element).radiocheck();
            }
        };
    }]);

    app.directive('ngPlaceholder', function() {
        return function(scope, element, attrs) {
            var e = document.createElement('div');
            e.innerHTML = attrs.ngPlaceholder;
            var decodedHtml = e.childNodes[0].nodeValue;
            element.attr('placeholder', decodedHtml);
        };
    });

})();
},{}],3:[function(require,module,exports){
(function() {
    var app = angular.module('listModule');

    app.controller('ListCreateController', ['Listes', '$window', '$timeout',
        function(Listes, $window, $timeout) {

            var controller = this;
            controller.model = ["", ""];
            controller.title = "";
            controller.author = "";
            controller.list = [];
            controller.newElement = [];
            controller.success = false;
            controller.creating = false;
            controller.created = false;

            controller.addColumn = function() {
                var length = controller.model.length;
                controller.model[length] = "";
                $timeout(function() {
                  controller.focusInput(length + 2);
                }, 100);
            };

            controller.focusInput = function(tabindex) {
                var inputs = document.getElementsByTagName("input"); //get all tabable elements
                for (var i = 0; i < inputs.length; i++) { //loop through each element
                    if (inputs[i].tabIndex == tabindex) { //check the tabindex to see if it's the element we want
                        inputs[i].focus(); //if it's the one we want, focus it and exit the loop
                        break;
                    }
                }
            }
            controller.removeColumn = function(columnId) {
                controller.model.splice(columnId, 1);
            };

            controller.restart = function() {
                $window.location.href = "/";
            };

            controller.createFile = function() {
                controller.creating = true;
                listes = new Listes('path/file');

                var data = {
                    data: "",
                    model: controller.model,
                    title: controller.title,
                    author: controller.author
                };

                listes.values = data;

                listes.createListe(function(response) {
                    $('#myModal').modal({
                        keyboard: false,
                        backdrop: "static"
                    });
                    controller.created = true;
                }, function(response) {
                    console.log('error');
                    console.log(response);
                });
            };
        }
    ]);
})()
},{}],4:[function(require,module,exports){
(function() {
    var app = angular.module('listModule');

    app.controller('ListDisplayController', ['$scope', '$sce', '$interval', 'Listes', '$route',
        function($scope, $sce, $interval, Listes, $route) {
            var scope = $scope;
            var controller = this;

            controller.emitConnectionStatus = function(isConnected) {
                scope.$emit('connectionStatusChange', isConnected);
            };

            controller.initValues = function(values) {
                if (!values) {
                    throw "List doesn't exist !";
                } 
                controller.list = values.data;
                if (!controller.list) {
                    controller.list = [];
                }
                controller.lastListLoaded = controller.list.slice(0);
                controller.model = values.model;
                controller.listTitle = values.title;
                controller.author = values.author;

                var json = controller.getCurrentJson(controller.list);
                localStorage.setItem(controller.storageId + 'list', json);
            };

            controller.trustAsHtml = function(html) {
                return $sce.trustAsHtml(html);
            };

            controller.addNewElement = function() {
                var elem = {};
                var i = 0;
                var empty = false;
                angular.forEach(controller.model, function(obj, key) {
                    if (i == 0) {
                        if (!controller.newElement[key]) {
                            empty = true;
                        }
                        i++;
                    }
                    elem[key] = controller.newElement[key];
                    controller.newElement[key] = '';
                });
            
                if (empty) {
                    return false;
                }
                controller.addElement(elem);
            }

            controller.addElement = function(elem) {
                controller.list[controller.list.length] = elem;
                controller.save();
            }

            controller.removeElement = function(record) {
                var index = controller.list.indexOf(record);
                if (index > -1) {
                    controller.list.splice(index, 1);
                    controller.save();
                }
            }
            controller.getCurrentJson = function(list) {
                var data = {
                    data: list,
                    model: controller.model,
                    title: controller.listTitle,
                    author: controller.author,
                };
                var json = angular.toJson(data);
                return json;
            };

            controller.load = function() {
                controller.listes.load(function(values) {
                    var jsonlist = controller.getCurrentJson(controller.list);
                    var jsonLastListLoaded = controller.getCurrentJson(controller.lastListLoaded);
                    var jsonValues = angular.toJson(values);
                    if (!controller.lastListLoaded) {
                        controller.initValues(values);
                    } else if (jsonLastListLoaded != jsonValues) {
                        if (jsonLastListLoaded == jsonlist) {
                            controller.initValues(values);
                        } else {
                            if (confirm('ça a bougé sur sur le serveur, veux tu écraser ta liste par celle du serveur ?')) {
                                controller.initValues(values);
                            } else {
                                controller.save();
                            }
                        }
                    } else if (jsonlist != jsonValues) {
                        controller.save();
                    }

                    controller.emitConnectionStatus(true);

                }, function() {
                    controller.emitConnectionStatus(false);
                });
            }

            controller.save = function() {
                $interval.cancel(controller.intervalLoading);
                $interval.cancel(controller.intervalSaving);

                var json = controller.getCurrentJson(controller.list);
                localStorage.setItem(controller.storageId + 'list', json);
                controller.listes.values = json;

                controller.listes.save(function(list) {
                    controller.lastListLoaded = controller.list.slice(0);
                    controller.intervalLoading = $interval(function() {
                        controller.load();
                    }, 4000);
                }, function() {
                    controller.emitConnectionStatus(false);
                    controller.intervalSaving = $interval(function() {
                        controller.save();
                    }, 4000);
                });

            }

            controller.activate = function(listId) {
                controller.listId = listId;
                controller.newElement = [];
                controller.connected = false;

                scope.$on('connectionStatusChange', function(event, isConnected) {
                    controller.connected = isConnected;
                })

                controller.listes = new Listes(controller.listId);
                controller.storageId = controller.listId+'-';

                controller.list = '';

                var local = localStorage.getItem(controller.storageId + 'list');
                if (angular.fromJson(local)) {
                    controller.initValues(angular.fromJson(local));
                }

                controller.load();
                controller.intervalLoading = $interval(function() {
                    controller.load();
                }, 4000);

                controller.intervalSaving = false;

                $scope.$on('$destroy', function iVeBeenDismissed() {
                    $interval.cancel(controller.intervalLoading);
                    $interval.cancel(controller.intervalSaving);
                })
            }

            var list = $route.current.params.listId
            controller.activate(list);

        }
    ]);
})()
},{}],5:[function(require,module,exports){
(function() {
    var app = angular.module('listModule', ['ngRoute', 'modelModule']);

    app.config(['$routeProvider',

        function($routeProvider) {
            $routeProvider.
            when('/list/new', {
                controller: 'ListCreateController',
                controllerAs: 'app',
                templateUrl: 'templates/listCreate.html'
            }).
            when('/list/:listId*', {
                controller: 'ListDisplayController',
                controllerAs: 'app',
                templateUrl: 'templates/list.html'
            }).
            otherwise({
                redirectTo: '/list/new'
            });
        }
    ]);
})()
},{}],6:[function(require,module,exports){
(function() {
    var app = angular.module('modelModule', ['serviceDreamFactoryBeta']);

    app.factory('Abstract', ['DreamFactory',
        function(DreamFactory) {
            function Abstract() {
                var data = {
                    records: [],
                    recordTemplateUrl: 'abstract',
                    apiDb: 'stadjadb',
                    apiFile: 'filestadja',
                    tableName: 'abstract',
                    related: null,
                    order: null,
                };
                this.setData(data);
            };

            Abstract.prototype = {
                setData: function(data) {
                    angular.extend(this, data);
                },
                _createRecordFromApi: function(apiRecord) {
                    return apiRecord;
                },
                postToWebService: function(service, args, callback, error) {
                    recordManager = this;
                    args.service = service+'?is_user_script=true';
                    args.is_user_script = 'true';
                    args.path = 'system/script/'+service
                    DreamFactory.call(
                        'system/script',
                        'post',
                        args,
                        function(response) {
                            if (callback) {
                                callback(response);
                            }
                        }, error
                    );
                },
                getFile: function(fileContainer, filePath, callback, error) {
                    recordManager = this;
                    DreamFactory.call(
                        recordManager.apiFile,
                        'getFile',
                        fileContainer+'/'+filePath,
                        function(response) {
                            if (callback) {
                                callback(response);
                            }
                        }, error
                    );
                },
                createFile: function(fileContainer, filePath, content, callback, error) {
                    recordManager = this;
                    DreamFactory.call(
                        recordManager.apiFile,
                        'createFile',
                        {
                            path: fileContainer+'/'+filePath,
                            content: content
                        },
                        function(response) {
                            if (callback) {
                                callback(response);
                            }
                        }, error
                    );
                },
                replaceFile: function(fileContainer, filePath, content, callback, error) {
                    recordManager = this;
                    DreamFactory.call(
                        recordManager.apiFile,
                        'replaceFile',
                        {
                            path: fileContainer+'/'+filePath,
                            content: content
                        },
                        function(response) {
                            if (callback) {
                                callback(response);
                            }
                        }, error
                    );
                },
                updateRecord: function(record, callback) {
                    recordManager = this;
                    record.table_name = recordManager.tableName;
                    DreamFactory.call(
                        recordManager.apiDb,
                        'updateRecord',
                            record
                        , function(response) {
                            if (callback) {
                                callback(record);
                            }
                        }
                    );
                },
                loadRecords: function(limit, offset, callback) {
                    recordManager = this;
                    DreamFactory.call(
                        recordManager.apiDb,
                        'getRecordsByFilter',
                        {
                            table_name: recordManager.tableName,
                            limit: limit,
                            offset: offset,
                            related: recordManager.related,
                            include_count: 'true',
                            order: recordManager.order
                        }, function(response) {
                            response = response.obj;
                            records = [];
                            angular.forEach(response.record, function(record) {
                                newRecord = recordManager._createRecordFromApi(record);
                                if (newRecord)
                                    records.push(newRecord);
                            });
                            recordManager.setData({
                                count: response.meta.count,
                                records: records
                            });
                            return callback ? callback(recordManager.records, recordManager.count) : true;
                        }
                    );
                }
            };
            return Abstract;
        }
    ]);
})()

},{}],7:[function(require,module,exports){
(function() {
    var app = angular.module('modelModule');

    app.factory('Listes',
        ['Abstract', 'DreamFactory', '$sce', function(Abstract, DreamFactory, $sce) {
            function Listes(filePath) {
                var listes = new Abstract();

                var data = {
                    fileContainer: 'courses',
                    filePath: filePath,
                    values: false,
                    loading: false,
                };
                listes.setData(data);

                listes.load = function(callback, error) {
                    listes.loading = true;
                    listes.getFile(listes.fileContainer, listes.filePath+'?'+(new Date().getTime()), function(result) {
                        listes.values = result;
                        listes.loading = false;
                        if (callback) {
                            callback(listes.values);
                        }
                    }, error);
                };

                listes.save = function(callback, error) {
                    listes.loading = true;
                    listes.replaceFile(listes.fileContainer, listes.filePath, listes.values, function(result) {
                        listes.loading = false;
                        if (callback) {
                            callback(listes.values);
                        }
                    }, error);
                };

                listes.create = function(callback, error) {
                    listes.loading = true;
                    listes.createFile(listes.fileContainer, listes.filePath, listes.values, function(result) {
                        listes.loading = false;
                        if (callback) {
                            callback(listes.values);
                        }
                    }, error);
                };

                listes.createListe = function(callback, error) {
                    listes.loading = true;
                    listes.postToWebService('create_liste', listes.values, function(result) {
                        listes.loading = false;
                        if (callback) {
                            callback(listes.values);
                        }
                    }, error);
                };


                return listes;
            };

            return Listes;
        }
    ]);
})()

},{}],8:[function(require,module,exports){
// http://wemadeyoulook.at/en/blog/implementing-basic-http-authentication-http-requests-angular/
(function() {

    var app = angular.module('serviceDreamFactoryBeta', []);

    app.service('DreamFactory', ['$http', function DreamFactory($http) {

        var dsp_url = "http://stadja.net:81/rest";
        var dsp_url_docs = "http://stadja.net:81/rest/api_docs";
        //replace this app_name with yours
        var app_name = "courses";

        var storageId = app_name;
        var tokenStorageId = storageId+".tokenId";
        var duration = 36000;

        $http.defaults.headers.common['X-DreamFactory-Application-Name'] = app_name;
        $http.defaults.headers.common['Content-Type'] = 'application/json';

        if (sessionStorage.getItem(tokenStorageId)) {
            $http.defaults.headers.common['X-DreamFactory-Session-Token'] = sessionStorage.getItem(tokenStorageId);
        }

        this.init = function(callback, login, pwd) {

        };

        this.call = function(apiName, apiAction, args, success, error) {
            var functionCalled = eval('this.'+apiAction);
            functionCalled(apiName, apiAction, args, success, error);
        };

        this.post = function(apiName, apiAction, args, success, error) {
            var service = args.service;
            args.service = null;
            $http.post(dsp_url+'/'+apiName+'/'+service, args)
            .success(function(data, status, headers, config) {
                success(data);
            }).error(function(data, status, headers, config) {
                error();
            });

        };

        this.getFile = function(apiName, apiAction, filePath, success, error) {
            $http.get(dsp_url+'/'+apiName+'/'+filePath,
                {
                }
            ).success(function(data, status, headers, config) {
                success(data);
            }).error(function(data, status, headers, config) {
                error();
            });

        };

        this.createFile = function(apiName, apiAction, args, success, error) {
            filePath = args.path;
            content = args.content;
            $http.post(dsp_url+'/'+apiName+'/'+filePath, content)
            .success(function(data, status, headers, config) {
                success(data);
            }).error(function(data, status, headers, config) {
                error();
            });

        };

        this.replaceFile = function(apiName, apiAction, args, success, error) {
            filePath = args.path;
            content = args.content;
            $http.put(dsp_url+'/'+apiName+'/'+filePath, content)
            .success(function(data, status, headers, config) {
                success(data);
            }).error(function(data, status, headers, config) {
                error();
            });

        };

        this.getRecordsByFilter = function (apiName, apiAction, args, callback) {
            var table_name = args.table_name;
            args.table_name = null;
            $http.get(dsp_url+'/'+apiName+'/'+table_name,
                {
                    params: args
                }
            ).success(function(data, status, headers, config) {
                var response = {
                    obj: data
                }
                callback(response);
            });
        };

        this.updateRecord = function (apiName, apiAction, args, callback) {
            var table_name = args.table_name;
            args.table_name = null;
            $http.patch(dsp_url+'/'+apiName+'/'+table_name+'/'+args.id,
                args
            ).success(function(data, status, headers, config) {
                var response = {
                    obj: data
                }
                callback(response);
            });
        };

        this.getSession = function(success, error) {
            $http.get(dsp_url+'/user/session').success(function(data, status, headers, config) {
                if (data.session_id) {
                    $http.defaults.headers.common['X-DreamFactory-Session-Token'] = data.session_id;
                    sessionStorage.setItem(tokenStorageId, data.session_id);
                    if (success) {
                        success(data, status, headers, config);
                    }
                } else if (error) {
                    error(data, status, headers, config);
                }
            }).error(function(data, status, headers, config) {
                console.log(data.error[0].message);
                if (error) {
                    error(data, status, headers, config);
                }
            });
        }

        this.logout = function(callback) {
            $http.delete(dsp_url+'/user/session').success(function(data, status, headers, config) {
                sessionStorage.removeItem(tokenStorageId);
                if (callback) {
                    callback(data, status, headers, config);
                }
            }).error(function(data, status, headers, config) {
                console.log(data.error[0].message);
            });
        }

        this.login = function(username, password, success, error) {
            $http.post(dsp_url+'/user/session',
                {
                    email: username,
                    password: password,
                    duration: duration
                }
            ).success(function(data, status, headers, config) {
                $http.defaults.headers.common['X-DreamFactory-Session-Token'] = data.session_id;
                sessionStorage.setItem(tokenStorageId, data.session_id);
                if (success) {
                    success(data, status, headers, config);
                }
            }).error(function(data, status, headers, config) {
                console.log(data.error[0].message);
                if (error) {
                    error(data, status, headers, config);
                }
            });
        }
    }]);
})()
},{}]},{},[1]);
