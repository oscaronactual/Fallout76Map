falloutApp.controller('groupsController', ['$uibModalInstance', 'mapDataService', '$document','$uibModal','settings', function($uibModalInstance, mapDataService, $document,$uibModal,settings) {
    var $ctrl = this;
    $ctrl.groups = mapDataService.groupList;
    $ctrl.Markers = mapDataService.markers;
    $ctrl.markersLookup = mapDataService.markersLookup;
    $ctrl.Categories = mapDataService.categories;
    $ctrl.categoriesLookup = mapDataService.categoriesLookup;
    $ctrl.getCategoryName = function(group){
        return $ctrl.categoriesLookup[group.CategoryId].CategoryName;
    };
    $ctrl.markerIcon = function(group){
        return settings.markerUrl + $ctrl.markersLookup[group.MarkerId].IconUrl;
    };
    $ctrl.newGroup = function(parentSelector){
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'newGroup.html',
            backdrop: 'static',
            controller: 'newGroupController',
            controllerAs: '$ctrl',
            size: "md"
        });
    };
    $ctrl.updateGroup = function(group){
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'updateGroup.html',
            backdrop: 'static',
            controller: 'updateGroupController',
            controllerAs: '$ctrl',
            size: "md",
            resolve: {
                groupToUpdate: function () {
                    return group;
                }
            }
        });
    };

    $ctrl.deleteGroup = function(group){
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'deleteGroup.html',
            backdrop: 'static',
            controller: 'deleteGroupController',
            controllerAs: '$ctrl',
            size: "md",
            resolve: {
                groupToDelete: function () {
                    return group;
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

falloutApp.controller('newGroupController', ['$uibModalInstance', 'mapDataService','settings', function($uibModalInstance, mapDataService, settings) {
    var $ctrl = this;
    $ctrl.groupName = "";
    $ctrl.categoryId = 0;
    $ctrl.markerId = 0;
    $ctrl.Markers = mapDataService.markers;
    $ctrl.markersLookup = mapDataService.markersLookup;
    $ctrl.Categories = mapDataService.categories;
    $ctrl.categoriesLookup = mapDataService.categoriesLookup;
    $ctrl.getIcon = function(){
        return settings.markerUrl + $ctrl.markersLookup[$ctrl.markerId].IconUrl;
    };

    $ctrl.ok = function () {
        mapDataService.addGroup({
            GroupName:$ctrl.groupName,
            CategoryId: $ctrl.categoryId,
            MarkerId: $ctrl.markerId
        });
        $uibModalInstance.close({
        });
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);

falloutApp.controller('updateGroupController', ['$uibModalInstance', 'mapDataService', 'groupToUpdate','settings', function($uibModalInstance, mapDataService, groupToUpdate,settings) {
    var $ctrl = this;
    $ctrl.groupName = groupToUpdate.GroupName;
    $ctrl.categoryId = groupToUpdate.CategoryId;
    $ctrl.markerId = groupToUpdate.MarkerId;
    $ctrl.Markers = mapDataService.markers;
    $ctrl.markersLookup = mapDataService.markersLookup;
    $ctrl.Categories = mapDataService.categories;
    $ctrl.categoriesLookup = mapDataService.categoriesLookup;
    $ctrl.getIcon = function(){
        return settings.markerUrl + $ctrl.markersLookup[$ctrl.markerId].IconUrl;
    };

    $ctrl.ok = function () {
        mapDataService.updateGroup({
            Id:groupToUpdate.Id,
            GroupName: $ctrl.groupName,
            CategoryId: $ctrl.categoryId,
            MarkerId: $ctrl.markerId
        });
        $uibModalInstance.close({
        });
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);

falloutApp.controller('deleteGroupController', ['$uibModalInstance', 'mapDataService', 'groupToDelete', function($uibModalInstance, mapDataService, groupToDelete) {
    var $ctrl = this;
    $ctrl.groupName = groupToDelete.GroupName;

    $ctrl.ok = function () {
        mapDataService.deleteGroup(groupToDelete);
        $uibModalInstance.close({
        });
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);