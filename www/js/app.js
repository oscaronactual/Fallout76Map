var falloutApp = angular.module("falloutApp", ['ui-leaflet', 'ui.bootstrap', 'ngAnimate','LocalStorageModule', 'uiSwitch']);

falloutApp.config(function(localStorageServiceProvider){
    localStorageServiceProvider
        .setPrefix('fallout76Map');

    localStorageServiceProvider
        .setStorageCookie(365, '/', false);
});