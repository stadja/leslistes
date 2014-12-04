(function() {
    var app = angular.module('Models', ['ServiceDreamFactoryBeta']);

    app.factory('Abstract', ['DreamFactory',
        function(DreamFactory) {
            function Abstract() {
                var data = {
                    records: [],
                    recordTemplateUrl: 'abstract',
                    apiDb: 'stadjadb',
                    apiFile: 'stadjadb',
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
