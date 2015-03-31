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