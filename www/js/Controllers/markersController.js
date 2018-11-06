falloutApp.controller('markersController', ['$uibModalInstance', 'mapDataService', '$document','$uibModal', 'settings', function($uibModalInstance, mapDataService, $document,$uibModal, settings) {
    var $ctrl = this;
    $ctrl.markers = mapDataService.markers;

    $ctrl.markerIcon = function(marker){
        return settings.markerUrl + marker.IconUrl;
    };

    $ctrl.newMarker = function(parentSelector){
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'newMarker.html',
            backdrop: 'static',
            controller: 'newMarkerController',
            controllerAs: '$ctrl',
            size: "md"
        });
    };
    $ctrl.updateMarker = function(marker){
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'updateMarker.html',
            backdrop: 'static',
            controller: 'updateMarkerController',
            controllerAs: '$ctrl',
            size: "md",
            resolve: {
                markerToEdit: function () {
                    return marker;
                }
            }
        });
    };

    $ctrl.deleteMarker = function(marker){
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'deleteMarker.html',
            backdrop: 'static',
            controller: 'deleteMarkerController',
            controllerAs: '$ctrl',
            size: "md",
            resolve: {
                markerToDelete: function () {
                    return marker;
                }
            }
        });
    };


    $ctrl.ok = function () {

        $uibModalInstance.close({
        });
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);

falloutApp.controller('newMarkerController', ['$uibModalInstance', 'mapDataService','settings', function($uibModalInstance, mapDataService, settings) {
    var $ctrl = this;
    $ctrl.markerName = "";
    $ctrl.iconUrl = "";

    $ctrl.getIcon = function(){
        return settings.markerUrl + $ctrl.iconUrl;
    };
    $ctrl.ok = function () {
        mapDataService.addMarker({markerName: $ctrl.markerName, iconUrl:$ctrl.iconUrl});
        $uibModalInstance.close({
        });
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);

falloutApp.controller('updateMarkerController', ['$uibModalInstance', 'mapDataService', 'markerToEdit','settings', function($uibModalInstance, mapDataService, markerToEdit,settings) {
    var $ctrl = this;
    $ctrl.markerToEdit = markerToEdit;
    $ctrl.markerName = markerToEdit.MarkerName;
    $ctrl.iconUrl = markerToEdit.IconUrl;
    $ctrl.getIcon = function(){
        return settings.markerUrl + $ctrl.iconUrl;
    };

    $ctrl.ok = function () {
        var markerClone = {
            Id: markerToEdit.Id,
            MarkerName: $ctrl.markerName,
            MarkerDescription: markerToEdit.Description,
            IconUrl: $ctrl.iconUrl,
            CreatedDate: markerToEdit.CreatedDate,
            ModifiedDate: markerToEdit.ModifiedDate
        };
        mapDataService.updateMarker(markerClone);
        $uibModalInstance.close({
        });
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);

falloutApp.controller('deleteMarkerController', ['$uibModalInstance', 'mapDataService', 'markerToDelete', function($uibModalInstance, mapDataService, markerToDelete) {
    var $ctrl = this;
    $ctrl.markerName = markerToDelete.MarkerName;
    $ctrl.ok = function () {
        mapDataService.deleteMarker(markerToDelete);
        $uibModalInstance.close({
        });
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);