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

                var json = controller.getCurrentJson(controller.list);
                localStorage.setItem(controller.storageId + 'list', json);
            };

            controller.trustAsHtml = function(html) {
                return $sce.trustAsHtml(html);
            };

            controller.addNewElement = function() {
                var elem = {};
                angular.forEach(controller.model, function(obj, key) {
                    elem[key] = controller.newElement[key];
                    controller.newElement[key] = '';
                });
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
                    title: controller.listTitle
                };
                var json = angular.toJson(data);
                return json;
            };

            controller.load = function() {
                controller.listes.load(function(values) {
                    var jsonlist = controller.getCurrentJson(controller.list);
                    var jsonLastListLoaded = controller.getCurrentJson(controller.lastListLoaded);
                    var jsonValues = angular.toJson(values);
                    if (jsonLastListLoaded != jsonValues) {
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
                controller.connected = false;

                scope.$on('connectionStatusChange', function(event, isConnected) {
                    controller.connected = isConnected;
                })

                controller.listes = new Listes(controller.listId+'.json');
                controller.storageId = controller.listId+'-';

                controller.list = '';

                if (localStorage.getItem(controller.storageId + 'list')) {
                    controller.initValues(angular.fromJson(localStorage.getItem(controller.storageId + 'list')));
                }

                controller.load();
                controller.intervalLoading = $interval(function() {
                    controller.load();
                }, 4000);

                controller.intervalSaving = false;
            }

            controller.activate($route.current.params.listId);

        }
    ]);
})()