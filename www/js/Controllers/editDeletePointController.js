falloutApp.controller('editDeletePointController', ['$uibModalInstance', 'pointspec', function($uibModalInstance, pointspec) {
    var $ctrl = this;

    $ctrl.pointName = pointspec.PointName;
    $ctrl.link = pointspec.Link;

    $ctrl.ok = function () {
        $uibModalInstance.close({
            pointId: pointspec.Id,
            pointName: $ctrl.pointName,
            link: $ctrl.link,
            lat: pointspec.lat,
            lng: pointspec.lng
        });
    };

    $ctrl.delete = function () {
        $uibModalInstance.close({
            pointId:pointspec.Id,
            delete: true
        });
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);