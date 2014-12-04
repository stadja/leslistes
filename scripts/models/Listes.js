(function() {
    var app = angular.module('Models');

    app.factory('Listes',
        ['Abstract', 'DreamFactory', '$sce', function(Abstract, DreamFactory, $sce) {
            function Listes(filePath) {
                var listes = new Abstract();

                var data = {
                    apiFile: 'filestadja',
                    fileContainer: 'courses',
                    filePath: filePath,
                    values: false,
                    tableValues: false,
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


                return listes;
            };

            return Listes;
        }
    ]);
})()
