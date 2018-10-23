var falloutApp = angular.module("falloutApp", ['ui-leaflet', 'ui.bootstrap', 'AdalAngular']);

falloutApp.config(['$httpProvider', 'adalAuthenticationServiceProvider', function( $httpProvider, adalAuthenticationServiceProvider){
    adalAuthenticationServiceProvider.init(
         {
             instance: 'https://login.microsoftonline.com/',
             tenant: 'coryblissittegmail.onmicrosoft.com',
             clientId: '1c0c3c53-bef3-4488-94a2-e10380af367c',
             extraQueryParameter: 'nux=1'
             //cacheLocation: 'localStorage', // enable this for IE, as sessionStorage does not work for localhost.
         },
         $httpProvider
     );
}]);