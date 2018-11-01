falloutApp.controller('mainController', ['$scope', 'leafletBoundsHelpers', 'leafletMapEvents', 'mapDataService', 'leafletData','$log', 'settings', function($scope, leafletBoundsHelpers,leafletMapEvents, mapDataService, leafletData, $log, settings) {
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



        $scope.definedLayers = {
            gameMap: {
                name: 'Fallout76 MapTiles',
                url: 'http://d2upr4z2n1fxid.cloudfront.net/{z}/{x}/{y}.png',
                layerParams:{
                    errorTileUrl: 'https://s3-us-west-1.amazonaws.com/fallout76maptiles/emptyTile.png',
                    noWrap: true,
                    maxZoom:8,
                    minZoom:3
                },
                type: 'xyz'
            },vector: {
                name: 'Fallout76 Topo',
                url: 'http://dfxypv9w3yb1b.cloudfront.net/{z}/{x}/{y}.png',
                layerParams:{
                    errorTileUrl: 'https://s3-us-west-1.amazonaws.com/fallout76maptiles/emptyTile.png',
                    noWrap: true,
                    maxZoom:8,
                    minZoom:3
                },
                type: 'xyz'
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
                    currentLayer:$scope.definedLayers["gameMap"]
                    /*gameMap: {
                        name: 'Fallout76 MapTiles',
                        url: 'http://d2upr4z2n1fxid.cloudfront.net/{z}/{x}/{y}.png',
                        layerParams:{
                            errorTileUrl: 'https://s3-us-west-1.amazonaws.com/fallout76maptiles/emptyTile.png',
                            noWrap: true,
                            maxZoom:8,
                            minZoom:3
                        },
                        type: 'xyz'
                    },vector: {
                        name: 'Fallout76 Topo',
                        url: 'http://dfxypv9w3yb1b.cloudfront.net/{z}/{x}/{y}.png',
                        layerParams:{
                            errorTileUrl: 'https://s3-us-west-1.amazonaws.com/fallout76maptiles/emptyTile.png',
                            noWrap: true,
                            maxZoom:8,
                            minZoom:3
                        },
                        type: 'xyz'
                    }*/
                },
                overlays: $scope.markerLayers
            },
            markers: $scope.markers,
            maxbounds: maxbounds,
            defaults:{
                attributionControl: false,
                zoomControlPosition: 'bottomright'
            }
        });

         function initializePointLayer(){
             $scope.layers.overlays = mapDataService.namedGroups;
             $scope.markers = mapDataService.pointsLookup;
         }
    };
    $scope.initialize();

    $scope.gameMapIsCurrent = true;
    $scope.changeCallback = function(){
        if ($scope.gameMapIsCurrent){
            $scope.setLayerCurrent("gameMap");
            $scope.gameMapIsCurrent = true;
        } else{
            $scope.setLayerCurrent("vector");
            $scope.gameMapIsCurrent = false;
        }
    };

    $scope.setLayerCurrent = function(layerName) {

        var baselayers = $scope.layers.baselayers;
        for (var property in baselayers){
            if (baselayers.hasOwnProperty(property)){
                delete baselayers[property];
            }
        }

        baselayers[layerName] = $scope.definedLayers[layerName];
    };

    leafletData.getMap().then(function(map){
        map.on("layeradd", function(layer){
            if(layer.layer.dragging){//Its a marker
                layer.layer.bindTooltip(layer.layer.options.PointName,{
                    direction: 'bottom',
                    offset: L.point(0, 15),
                    permanent: layer.layer.options.AlwaysShowTooltip,
                    className: layer.layer.options.GroupId === 59 ? "regionTooltip" : ""
                });
            }
        });
    });

    $scope.categories = mapDataService.categories;
    $scope.getMarkerUrl = function(marker){
        return settings.markerUrl + marker.IconUrl;
    };

    $scope.setGroupStates = function(group){
        group.visible = !group.visible;
        this.layers.overlays[group.GroupName].visible = group.visible;
    }


}]);