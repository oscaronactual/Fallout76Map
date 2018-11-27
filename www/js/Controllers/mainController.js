falloutApp.controller('mainController', ['$scope', 'leafletBoundsHelpers', 'leafletMapEvents', 'mapDataService', 'leafletData','$log', 'settings','localStorageService', '$stateParams', function($scope, leafletBoundsHelpers,leafletMapEvents, mapDataService, leafletData, $log, settings,localStorageService, $stateParams) {

    var factorx = 0.00022;
    var factory = 0.00022;

    L.CRS.falloutProjection = L.extend({}, L.CRS.Simple, {
        projection: L.Projection.LonLat,
        transformation: new L.Transformation(factorx, 64.175, -factory, 64.22),
        // Changing the transformation is the key part, everything else is the same.
        // By specifying a factor, you specify what distance in meters one pixel occupies (as it still is CRS.Simple in all other regards).
        // In this case, I have a tile layer with 256px pieces, so Leaflet thinks it's only 256 meters wide.
        // I know the map is supposed to be 2048x2048 meters, so I specify a factor of 0.125 to multiply in both directions.
        // In the actual project, I compute all that from the gdal2tiles tilemapresources.xml,
        // which gives the necessary information about tilesizes, total bounds and units-per-pixel at different levels.


// Scale, zoom and distance are entirely unchanged from CRS.Simple
        scale: function(zoom) {
            return Math.pow(2, zoom);
        },

        zoom: function(scale) {
            return Math.log(scale) / Math.LN2;
        },

        distance: function(latlng1, latlng2) {
            var dx = latlng2.lng - latlng1.lng,
                dy = latlng2.lat - latlng1.lat;

            return Math.sqrt(dx * dx + dy * dy);
        },
        infinite: true
    });




    $scope.initialize = function(){


        $scope.pointGroups = mapDataService.groupedPoints;
        //$scope.markers =  mapDataService.points;
        $scope.markerLayers = {};
        $scope.markers = {};


        localStorageService.bind($scope, 'selectedLayer');

        if ($scope.selectedLayer === null || $scope.selectedLayer === ''){
            $scope.selectedLayer = 'gameMap';
        }

        $scope.definedLayers = {
            gameMap: {
                name: 'Fallout76 MapTiles',
                url: '/fallout76map/{z}/{x}/{y}.png',
                layerParams:{
                    errorTileUrl: '/emptyTile.png',
                    noWrap: true,
                    maxZoom:8,
                    minZoom:3
                },
                type: 'xyz'
            },vector: {
                name: 'Fallout76 Topo',
                url: '/fo76milmap/{z}/{x}/{y}.png',
                layerParams:{
                    errorTileUrl: '/emptyTile.png',
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
            defaults:{
                attributionControl: false,
                zoomControlPosition: 'bottomright',
                crs:"falloutProjection"
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

    $scope.$on("leafletDirectiveMap.mousemove", function(e, args){
        $scope.currentLat = Math.round(args.leafletEvent.latlng.lat);
        $scope.currentLong = Math.round(args.leafletEvent.latlng.lng);
        $scope.currentGridX = Math.floor(args.leafletEvent.latlng.lng/4152);
        $scope.currentGridY = Math.floor(args.leafletEvent.latlng.lat/4072);
    });

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

    $scope.getGroupIcon = function(group){
        return "icon-" + group.Marker.IconUrl.replace(".png", "");
    }
}]);