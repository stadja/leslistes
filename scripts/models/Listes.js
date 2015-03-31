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
