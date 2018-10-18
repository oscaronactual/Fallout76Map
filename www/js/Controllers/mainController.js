falloutApp.controller('mainController', ['$scope', 'leafletBoundsHelpers', 'leafletMapEvents', 'mapDataService', function($scope, leafletBoundsHelpers,leafletMapEvents, mapDataService) {
    $scope.initialize = function(){

        mapDataService.initializePoints(initializePointLayer);
        $scope.pointGroups = mapDataService.groupedPoints;
        //$scope.markers =  mapDataService.points;
        $scope.markerLayers = {};
        $scope.markers = {};
        var mapExtent = [0.00000000, -4356.00000000, 4356.00000000, 0.00000000];
        var maxbounds = {
            northEast:{
                lat:85.05,
                lng:11.5
            },
            southWest:{
                lat: -11.36,
                lng: -180.01
            }
        };

        $scope.$on("leafletDirectiveMap.mousemove", function(e, args){
            $scope.currentLat = args.leafletEvent.latlng.lat;
            $scope.currentLong = args.leafletEvent.latlng.lng;
        });
        angular.extend($scope, {
            /*bounds: maxbounds,*/
            center: {
                lat: 65,
                lng: -86,
                zoom: 3
            },
            layers: {
                baselayers: {
                    xyz: {
                        name: 'Fallout76 MapTiles',
                        url: 'http://d2upr4z2n1fxid.cloudfront.net/{z}/{x}/{y}.png',
                        options:{
                            errorTileUrl: 'img/tiles/emptyTile.png',
                            noWrap: true
                        },
                        type: 'xyz'
                    }
                },
                overlays: $scope.markerLayers
            },
            markers: $scope.markers,
            maxbounds: maxbounds
        });

         function initializePointLayer(){
             $scope.layers.overlays = mapDataService.namedGroups;
             $scope.markers = mapDataService.pointsLookup;
         }
    };
    $scope.initialize();
}]);