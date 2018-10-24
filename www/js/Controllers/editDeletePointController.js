falloutApp.controller('editDeletePointController', ['$uibModalInstance', 'pointspec', 'mapDataService', function($uibModalInstance, pointspec, mapDataService) {
    var $ctrl = this;

    $ctrl.pointName = pointspec.PointName;
    $ctrl.link = pointspec.Link;
    $ctrl.description = pointspec.Description;

    $ctrl.ok = function () {
        mapDataService.updatePoint({
            pointId: pointspec.Id,
            pointName: $ctrl.pointName,
            description: $ctrl.description,
            link: $ctrl.link,
            lat: pointspec.lat,
            lng: pointspec.lng,
            GroupId: pointspec.GroupId,
            MarkerId: pointspec.MarkerId
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