falloutApp.controller('newPointController', ['$uibModalInstance', 'location', 'mapDataService', function($uibModalInstance, location, mapDataService) {
    var $ctrl = this;

    $ctrl.pointName = '';
    $ctrl.link = '';
    $ctrl.description = '';
    $ctrl.markerId = 0;
    $ctrl.groupId = 0;
    $ctrl.groups = mapDataService.namedGroups;
    $ctrl.markers = mapDataService.markersLookup;
    $ctrl.iconUrl = function(){
        var marker = $ctrl.markers[$ctrl.markerId];
        if(marker){
            return '/markers/' + $ctrl.markers[$ctrl.markerId].IconUrl;
        }else{return '';}
    };
    $ctrl.ok = function () {
        $uibModalInstance.close({
            pointName: $ctrl.pointName,
            link: $ctrl.link,
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