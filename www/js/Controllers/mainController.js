falloutApp.controller('mainController', ['$scope', 'leafletBoundsHelpers', 'leafletMapEvents', 'mapDataService','$uibModal', 'leafletData','$log', 'settings', function($scope, leafletBoundsHelpers,leafletMapEvents, mapDataService, $uibModal, leafletData, $log, settings) {

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
            controller: 'groupsController',
            controllerAs: '$ctrl',
            size: "md"
        });
    };


    $scope.definedLayers = {
        oldMap: {
            name: 'Fallout76 MapTiles',
            url: 'http://d1sv6jqpfm1rn8.cloudfront.net/{z}/{x}/{y}.png',
            layerParams:{
                errorTileUrl: 'https://s3-us-west-1.amazonaws.com/fallout76maptiles/emptyTile.png',
                noWrap: true,
                maxZoom:8,
                minZoom:3
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
    });

    $scope.initialize = function(){
        $scope.editModeEnabled = false;
        $scope.categories = mapDataService.categories;
        $scope.pointGroups = mapDataService.groupedPoints;
        $scope.markerLayers = {};
        $scope.markers = {};

        mapDataService.initializePoints(initializePointLayer);
        //$scope.markers =  mapDataService.points;
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
}]);