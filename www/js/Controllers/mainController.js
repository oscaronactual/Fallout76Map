falloutApp.controller('mainController', ['$scope', 'leafletBoundsHelpers', 'leafletMapEvents', 'mapDataService','$uibModal','$log', function($scope, leafletBoundsHelpers,leafletMapEvents, mapDataService, $uibModal, $log) {
    $scope.initialize = function(){
        $scope.alerts = [];
        $scope.addAlert = function(message) {
            $scope.alerts.push({msg: message, "dismiss-on-timeout": 2000, "template-url": "alert.html"});
        };

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

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
            //Open reposition point confirmation

        });

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
                    $scope.addAlert("New Point Added")
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


        angular.extend($scope, {
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
                        layerParams:{
                            errorTileUrl: 'https://s3-us-west-1.amazonaws.com/fallout76maptiles/emptyTile.png',
                            noWrap: true
                        },
                        type: 'xyz'
                    }
                },
                overlays: $scope.markerLayers
            },
            markers: $scope.markers
            ,maxbounds: maxbounds
        });

         function initializePointLayer(){
             $scope.layers.overlays = mapDataService.namedGroups;
             $scope.markers = mapDataService.pointsLookup;
         }
    };
    $scope.initialize();
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
}]);