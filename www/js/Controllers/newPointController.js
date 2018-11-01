falloutApp.controller('newPointController', ['$uibModalInstance', 'location', 'mapDataService', 'settings', function($uibModalInstance, location, mapDataService, settings) {
    var $ctrl = this;

    $ctrl.pointName = '';
    $ctrl.link = '';
    $ctrl.description = '';
    $ctrl.markerId = 0;
    $ctrl.groupId = 0;
    $ctrl.groups = mapDataService.groupList;
    $ctrl.markers = mapDataService.markers;
    $ctrl.markersLookup = mapDataService.markersLookup;
    $ctrl.iconUrl = function(){
        var marker = $ctrl.markersLookup[$ctrl.markerId];
        if(marker){
            return settings.markerUrl + marker.IconUrl;
        }else{return '';}
    };
    $ctrl.ok = function () {
        $uibModalInstance.close({
            pointName: $ctrl.pointName,
            link: $ctrl.link,
            description: $ctrl.description,
            lat: location.lat,
            lng: location.lng,
            markerId: $ctrl.markerId,
            groupId: $ctrl.groupId
        });
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);