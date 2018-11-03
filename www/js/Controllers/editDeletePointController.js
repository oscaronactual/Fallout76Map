falloutApp.controller('editDeletePointController', ['$uibModalInstance', 'pointspec', 'mapDataService', 'settings', function($uibModalInstance, pointspec, mapDataService, settings) {
    var $ctrl = this;

    $ctrl.pointName = pointspec.PointName;
    $ctrl.link = pointspec.Link;
    $ctrl.description = pointspec.Description;
    $ctrl.markerId = pointspec.MarkerId;
    $ctrl.groupId = pointspec.GroupId;
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
        mapDataService.updatePoint({
            Id: pointspec.Id,
            PointName: $ctrl.pointName,
            Description: $ctrl.description,
            Link: $ctrl.link,
            LatCoord: pointspec.lat,
            LongCoord: pointspec.lng,
            GroupId: $ctrl.groupId,
            MarkerId: $ctrl.markerId,
            AlwaysShowTooltip: pointspec.AlwaysShowToolTip
        });
        $uibModalInstance.close();
    };

    $ctrl.delete = function () {
        mapDataService.deletePoint(editPointDefinition);
        $uibModalInstance.close();
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);

falloutApp.controller('movePointController', ['$uibModalInstance', 'point', function($uibModalInstance, point) {
    var $ctrl = this;

    $ctrl.pointName = point.PointName;

    $ctrl.ok = function () {
        $uibModalInstance.close();
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);