var app = angular.module('myApp', ['ngRoute', 'firebase', 'angular-toArrayFilter']);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            controller: 'MainController',
            templateUrl: 'views/main.html'
        }).when('/home', {
            controller: 'HomeController',
            templateUrl: 'views/home.html'
        }).when('/user/:username', {
            controller: 'UserController',
            templateUrl: 'views/user.html'
        }).when('/reward', {
            controller: 'RewardController',
            templateUrl: 'views/reward.html'
        }).when('/post/:post_uid', {
            controller: 'PostController',
            templateUrl: 'views/post.html'
        }).when('/user/admin', {
            redirectTo: '/'
        }).otherwise({
            redirectTo: '/'
        });
}]);