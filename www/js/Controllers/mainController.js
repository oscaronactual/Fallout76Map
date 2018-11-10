falloutApp.controller('mainController', ['$scope', 'leafletBoundsHelpers', 'leafletMapEvents', 'mapDataService', 'leafletData','$log', 'settings','localStorageService', '$stateParams', function($scope, leafletBoundsHelpers,leafletMapEvents, mapDataService, leafletData, $log, settings,localStorageService, $stateParams) {
    $scope.initialize = function(){


        $scope.pointGroups = mapDataService.groupedPoints;
        //$scope.markers =  mapDataService.points;
        $scope.markerLayers = {};
        $scope.markers = {};
        var mapExtent = [0.00000000, -4356.00000000, 4356.00000000, 0.00000000];
        var maxbounds = {
            northEast:{
                lat:175,
                lng:90
            },
            southWest:{
                lat: -100,
                lng: -250
            }
        };

        localStorageService.bind($scope, 'selectedLayer');

        if ($scope.selectedLayer === null || $scope.selectedLayer === ''){
            $scope.selectedLayer = 'gameMap';
        }

        $scope.definedLayers = {
            gameMap: {
                name: 'Fallout76 MapTiles',
                url: 'http://d1sv6jqpfm1rn8.cloudfront.net/{z}/{x}/{y}.png',
                layerParams:{
                    errorTileUrl: 'https://s3-us-west-1.amazonaws.com/fallout76maptiles/emptyTile.png',
                    noWrap: true,
                    maxZoom:8,
                    minZoom:3
                },
                type: 'xyz'
            },vector: {
                name: 'Fallout76 Topo',
                url: 'http://d1rl5aw7fz8q45.cloudfront.net/{z}/{x}/{y}.png',
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
            center: {
                lat: 70,
                lng: -90,
                zoom: 4
            },
            layers: {
                baselayers: {
                    currentLayer:$scope.definedLayers[$scope.selectedLayer]
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

        mapDataService.initializePoints(initializePointLayer);
         function initializePointLayer(){
             $scope.layers.overlays = mapDataService.namedGroups;
             $scope.markers = mapDataService.pointsLookup;
             localStorageService.bind($scope, 'groupsSelected');
             $scope.isAllDeselected = $scope.groupsSelected === [];
             if ($stateParams.pointId !== null && $stateParams.pointId > 0){
                var findPoint = mapDataService.pointsLookup[$stateParams.pointId];

                mapDataService.points.forEach(function(element){
                    element.focus = false;
                });

                if (findPoint){
                    $scope.center.lat = findPoint.lat;
                    $scope.center.lng = findPoint.lng;
                    findPoint.focus = true;
                }
             }
         }
    };
    $scope.initialize();

    $scope.gameMapIsCurrent = $scope.selectedLayer === "gameMap";
    $scope.changeCallback = function(){
        if ($scope.gameMapIsCurrent){
            $scope.setLayerCurrent("gameMap");
            $scope.selectedLayer = "gameMap";
            $scope.gameMapIsCurrent = true;
        } else{
            $scope.setLayerCurrent("vector");
            $scope.selectedLayer = "vector";
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

    if (!$scope.categories){
        $scope.categories = mapDataService.categories;
    }
    $scope.getMarkerUrl = function(marker){
        var url = marker ? marker.IconUrl : "";
        return settings.markerUrl + url;
    };

    $scope.setGroupStates = function(group){
        group.visible = !group.visible;
        this.layers.overlays[group.GroupName].visible = group.visible;

        recordGroupSelectionStatus(group);
    };

    function recordGroupSelectionStatus(group){
        if(group.visible){
            //var selectedGroups = localStorageService.get('selectedGroups');
            if (!$scope.groupsSelected.includes(group.Id)){
                $scope.groupsSelected.push(group.Id);
                /*localStorageService.set('selectedGroups',selectedGroups);*/
            }
        }else{
            if($scope.groupsSelected.includes(group.Id)){
                var index = $scope.groupsSelected.findIndex(function(element){
                    return element === group.Id;
                });
                $scope.groupsSelected.splice(index, 1);
            }
        }
    }

    $scope.selectToggleAll = function(category){
        var someGroupsAreSelected = category.Groups.some(function (element) {
            return element.visible;
        });

        if (someGroupsAreSelected){
            category.Groups.forEach(function(element){
                element.visible = false;
                recordGroupSelectionStatus(element);
            });
            category.isDeselected = true;
        } else{
            category.Groups.forEach(function(element){
                element.visible = true;
                recordGroupSelectionStatus(element);
            });
            category.isDeselected = false;
        }
    };

    $scope.toggleInverse = function(){
        $scope.categories.forEach(function(category){
            category.Groups.forEach(function(group){
                group.visible = !group.visible;
                recordGroupSelectionStatus(group);
            })
        });
    };

    $scope.toggleAll = function(){
        if($scope.isAllDeselected){
            $scope.categories.forEach(function(category){
                category.Groups.forEach(function(element){
                    element.visible = true;
                    recordGroupSelectionStatus(element);
                });
                category.isDeselected = false;
            });
            $scope.isAllDeselected = false;
        }else{
            $scope.categories.forEach(function(category){
                category.Groups.forEach(function(element){
                    element.visible = false;
                    recordGroupSelectionStatus(element);
                });
                category.isDeselected = true;
            });
            $scope.isAllDeselected = true;
        }

    }

}]);