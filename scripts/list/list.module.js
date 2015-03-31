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