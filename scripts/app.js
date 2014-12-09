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
}

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

(function() {
    var app = angular.module('Courses', ['ngRoute', 'Controllers']);

    app.config(['$routeProvider',

        function($routeProvider) {
            $routeProvider.
            when('/list/:listId', {
                controller: 'AppController',
                controllerAs: 'app',
                templateUrl: 'templates/list.html'
            }).
            otherwise({
                redirectTo: '/list/courses'
            });
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

})()