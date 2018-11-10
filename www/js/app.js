var falloutApp = angular.module("falloutApp", ['ui-leaflet', 'ui.bootstrap', 'ngAnimate','LocalStorageModule', 'uiSwitch', 'ui.router', 'ngclipboard']);

falloutApp.config(function(localStorageServiceProvider, $stateProvider, $urlRouterProvider){
    localStorageServiceProvider
        .setPrefix('fallout76Map');

    localStorageServiceProvider
        .setStorageCookie(365, '/', false);

    $stateProvider.state({
        name: '/',
        url: '/:pointId',
        templateUrl: '/views/main.html',
        controller: 'mainController'
    });

/*    $urlRouterProvider.when('/', 'main');*/
      $urlRouterProvider.otherwise('/');
});