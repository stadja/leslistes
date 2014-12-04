(function() {
    var app = angular.module('Controllers', ['Models']);

    app.controller('AppController', ['$scope', '$sce', '$interval','Listes', function($scope, $sce, $interval, Listes) {
        var scope = $scope;
        var controller = this;

        controller.connected = false;

        controller.listes = new Listes('courses.json');

        controller.storageId = 'courses-';
        controller.model = {
            product: 'produit',
            quantity: 'quantit&eacute;'
        };

        controller.list = '';
        controller.list = angular.fromJson(localStorage.getItem(controller.storageId+'list')).data;
        if (!controller.list) {
		controller.list = [];
	}
	controller.lastListLoaded = controller.list.slice(0);

        if (!controller.list) {
            controller.list = [];
        }

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
                model: controller.model
            };
            var json = angular.toJson(data);
            return json;
        };

        controller.load = function () {
            controller.listes.load(function(values) {
                var jsonlist = controller.getCurrentJson(controller.list);
                var jsonLastListLoaded = controller.getCurrentJson(controller.lastListLoaded);
                var jsonValues = angular.toJson(values);
                if (jsonLastListLoaded != jsonValues) {
                    if(jsonLastListLoaded == jsonlist) {
                        controller.list = values.data.slice(0);
                        controller.lastListLoaded = values.data.slice(0);
                        var json = controller.getCurrentJson(controller.list);
                        localStorage.setItem(controller.storageId+'list', json);
                    } else {
                        if(confirm('ça a bougé sur sur le serveur, veux tu écraser ta liste par celle du serveur ?')) {
                            controller.list = values.data.slice(0);
                            controller.lastListLoaded = values.data.slice(0);
                            var json = controller.getCurrentJson(controller.list);
                            localStorage.setItem(controller.storageId+'list', json);
                        } else {
                            controller.save();
                        }
                    }
                } else if(jsonlist != jsonValues) {
                    controller.save();
                }

                controller.connected = true;

            }, function() {
                controller.connected = false;
            });
        }

        controller.save = function() {
            $interval.cancel(controller.intervalLoading);
            $interval.cancel(controller.intervalSaving);

            var json = controller.getCurrentJson(controller.list);
            localStorage.setItem(controller.storageId+'list', json);
            controller.listes.values = json;

            controller.listes.save(function(list){
                controller.lastListLoaded = controller.list.slice(0);
                    controller.intervalLoading = $interval(function() {
                        controller.load();
                    }, 4000);
                }, function() {
                    controller.connected = false;
                    controller.intervalSaving = $interval(function() {
                        controller.save();
                    }, 4000);
                }
            );

        }

        controller.load();
        controller.intervalLoading = $interval(function() {
            controller.load();
        }, 4000);

        controller.intervalSaving = false;

    }]);
})()
