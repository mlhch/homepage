require(['angular', 'moment', 'config'], function fn(angular, moment, config) {
    angular.element(document).ready(function() {
        angular.module('app', []).controller('MainCtrl', ['$scope',
            function fn($scope) {
                var start = 0,
                    limit = 25,
                    recentUpdates = [];
                config.recentArticles(function success(res) {
                    $scope.$apply(function() {
                        $scope.status = 'success';
                        recentUpdates = res.map(function fn(row) {
                            row.time = moment(row.time).fromNow();
                            return row;
                        });
                        recentGo();
                    });
                });

                $scope.isFirst = function() {
                    return start === 0;
                }
                $scope.isLast = function() {
                    return start + limit === recentUpdates.length;
                }
                $scope.recentGoPrev = function() {
                    start = Math.max(0, start - limit), recentGo();
                }
                $scope.recentGoNext = function() {
                    start = Math.min(recentUpdates.length - limit, start + limit), recentGo();
                }
                $scope.recentLoaded = function() {
                    return recentUpdates.length;
                }
                $scope.showArticle = function(row) {
                    require(['fancybox'], function(fancybox) {
                        fancybox.showLoading();
                        config.articleBlob(row.title, row.sha, function success(res) {
                            fancybox(res.content, {
                                title: res.title,
                                margin: [50, 50, 50, 50]
                            });
                        }, function error(errorMsg) {
                            alert('Sorry, server no response');
                        });
                    });
                }

                function recentGo() {
                    $scope.recent = recentUpdates.slice(start, start + limit)
                }
            }
        ]);

        document.body.setAttribute('ng-controller', 'MainCtrl');
        angular.bootstrap(document.body, ['app']);
    });
});