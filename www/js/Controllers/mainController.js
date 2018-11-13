falloutApp.controller('mainController', ['$scope', 'leafletBoundsHelpers', 'leafletMapEvents', 'mapDataService','$uibModal', 'leafletData','$log', 'settings', function($scope, leafletBoundsHelpers,leafletMapEvents, mapDataService, $uibModal, leafletData, $log, settings) {



    var factorx = 0.000218;
    var factory = 0.0002225;

    L.CRS.pr = L.extend({}, L.CRS.Simple, {
        projection: L.Projection.LonLat,
        transformation: new L.Transformation(factorx, 63.525, -factory, 64.02),
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









    $scope.setEditMode = function(){
        mapDataService.points.forEach(function(element, index, array){
            element.draggable = $scope.editModeEnabled;
        });
    };

    $scope.newPoint = function (parentSelector) {
        var parentElem = parentSelector ?
            angular.element($document[0].querySelector('.mainController ' + parentSelector)) : undefined;
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'newPoint.html',
            backdrop: 'static',
            controller: 'newPointController',
            controllerAs: '$ctrl',
            size: "md",
            appendTo: parentElem,
            resolve: {
                location: function () {
                    return $scope.newPointPosition;
                }
            }
        });

        modalInstance.result.then(function (newPointDefinition) {
            mapDataService.addPoint(newPointDefinition, function(){
            });
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.editPoint = function (point) {
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'editDeletePoint.html',
            backdrop: 'static',
            controller: 'editDeletePointController',
            controllerAs: '$ctrl',
            size: "md",
            resolve: {
                pointspec: function () {
                    return point;
                }
            }
        });
    };


    leafletData.getMap().then(function(map){
        map.on("layeradd", function(layer){
            if(layer.layer.dragging){//Its a marker
                layer.layer.bindTooltip(layer.layer.options.PointName,{
                    direction: 'bottom',
                    offset: L.point(0, 15)
                })
            }
        });
    });

    $scope.getMarkerUrl = function(marker){
        var url = marker ? marker.IconUrl : "";
        return settings.markerUrl + url;
    };

    $scope.setGroupStates = function(group){
        group.visible = !group.visible;
        this.layers.overlays[group.GroupName].visible = group.visible;
    };

    $scope.showCategories = function(){
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'showCategories.html',
            backdrop: 'static',
            controller: 'categoriesController',
            controllerAs: '$ctrl',
            size: "md"
        });
    };

    $scope.showMarkers = function(){
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'showMarkers.html',
            backdrop: 'static',
            controller: 'markersController',
            controllerAs: '$ctrl',
            size: "md"
        });
    };

    $scope.showGroups = function(){
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'showGroups.html',
            backdrop: 'static',
            controller: 'groupsController',
            controllerAs: '$ctrl',
            size: "md"
        });
    };



    $scope.selectToggleAll = function(category){
        var someGroupsAreSelected = category.Groups.some(function (element) {
            return element.visible;
        });

        if (someGroupsAreSelected){
            category.Groups.forEach(function(element){
                element.visible = false;
                category.isDeselected = true;
            })
        } else{
            category.Groups.forEach(function(element){
                element.visible = true;
                category.isDeselected = false;
            })
        }
    };


    $scope.definedLayers = {
        oldMap: {
            name: 'Fallout76 MapTiles',
            url: 'http://d1sv6jqpfm1rn8.cloudfront.net/{z}/{x}/{y}.png',
            layerParams:{
                errorTileUrl: 'https://s3-us-west-1.amazonaws.com/fallout76maptiles/emptyTile.png',
                noWrap: true,
                maxZoom:8,
                minZoom:3,
                crs: "simple"
            },
            type: 'xyz'
        },newMap: {
            name: 'Fallout76 New',
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

    $scope.newMapIsCurrent = false;
    $scope.toggleCurrentLayer = function(){
        if ($scope.newMapIsCurrent){
            $scope.setLayerCurrent("newMap");
            $scope.gameMapIsCurrent = false;
        } else{
            $scope.setLayerCurrent("oldMap");
            $scope.gameMapIsCurrent = true;
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

        //[,]
        var southWest = map.unproject([-192159, -180824], map.getMaxZoom());
        var northEast = map.unproject([230126,205888], map.getMaxZoom());
        map.setMaxBounds(new L.LatLngBounds(southWest,northEast));
    });

    $scope.initialize = function(){
        $scope.editModeEnabled = false;
        $scope.categories = mapDataService.categories;
        $scope.pointGroups = mapDataService.groupedPoints;
        $scope.markerLayers = {};
        $scope.markers = {};

        mapDataService.initializePoints(initializePointLayer);

        $scope.$on("leafletDirectiveMap.mousemove", function(e, args){
            $scope.currentLat = Math.round(args.leafletEvent.latlng.lat);
            $scope.currentLong = Math.round(args.leafletEvent.latlng.lng);
            $scope.currentGridX = Math.floor(args.leafletEvent.latlng.lng/4152);
            $scope.currentGridY = Math.floor(args.leafletEvent.latlng.lat/4072);
        });

        $scope.$on("leafletDirectiveMap.click", function(e, args){
            if(args.leafletEvent.latlng.lat > maxbounds.southWest.lat &&
                args.leafletEvent.latlng.lat < maxbounds.northEast.lat &&
                args.leafletEvent.latlng.lng > maxbounds.southWest.lng &&
                args.leafletEvent.latlng.lng < maxbounds.northEast.lng ){
                $scope.newPointPosition = args.leafletEvent.latlng;
                $scope.newPoint();
            }
        });

        $scope.$on("leafletDirectiveMarker.click", function(e, args){
            //Open Edit/Delete Point Modal
            $scope.editPoint(args.leafletObject.options);

        });

        $scope.$on("leafletDirectiveMarker.dragend", function(e, args){

            var point = args.leafletObject.options;
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'movePoint.html',
                backdrop: 'static',
                controller: 'movePointController',
                controllerAs: '$ctrl',
                size: "md",
                resolve: {
                    point: function () {
                        return point;
                    }
                }
            });
            modalInstance.result.then(function (newPointDefinition) {
                point.LatCoord = args.leafletEvent.target._latlng.lat;
                point.LongCoord = args.leafletEvent.target._latlng.lng;
                mapDataService.updatePoint(point, function(){
                });
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        });

        angular.extend($scope, {
            center: {
                lat: 65,
                lng: -86,
                zoom: 3
            },
            layers: {
                baselayers: {
                    currentLayer:$scope.definedLayers["oldMap"]
                },
                overlays: $scope.markerLayers
            },
            markers: $scope.markers,
            defaults:{
                attributionControl: false,
                zoomControlPosition: 'bottomright',
                crs:"pr"
            }
        });

        function initializePointLayer(){
            $scope.layers.overlays = mapDataService.namedGroups;
            $scope.markers = mapDataService.pointsLookup;
        }
    };
    $scope.initialize();
}]);