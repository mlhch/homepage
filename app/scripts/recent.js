require(['angular', 'moment', 'config'], function fn(angular, moment, config) {
    angular.element(document).ready(function() {
        angular.module('app', []).controller('MainCtrl', ['$scope',
            function fn($scope) {
                $scope.status = 'loading';
                $scope.statusClasses = {
                    failure: 'alert-box warning',
                    loading: 'loading',
                    success: 'ng-hide'
                };
                var start = 0,
                    limit = 25,
                    recentUpdates = [];
                config.recentArticles(function success(res) {
                    $scope.$apply(function() {
                        $scope.status = 'success';
                        res.forEach(function fn(row) {
                            row.time = moment(row.time * 1000).fromNow();
                        });
                        recentUpdates = res;
                        recentGo();
                    });
                }, function failure() {
                    $scope.$apply(function() {
                        $scope.status = 'failure';
                        $scope.errMsg = 'No response from server';
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
                        fancybox.opts.tpl = fancybox.defaults.tpl; // 查看代码后的 bug 修补
                        fancybox.showLoading();
                        config.articleBlob(row.title, row.sha, function success(res) {
                            res.content = '<p style="white-space:pre-wrap;">' + res.content + '</p>'; // jQuery需要有标签包围
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