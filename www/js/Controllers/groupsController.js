falloutApp.controller('groupsController', ['$uibModalInstance', 'mapDataService', '$document','$uibModal', function($uibModalInstance, mapDataService, $document,$uibModal) {
    var $ctrl = this;
    $ctrl.groups = mapDataService.namedGroups;
    $ctrl.Markers = mapDataService.markersLookup;
    $ctrl.Categories = mapDataService.categoriesLookup;
    $ctrl.getCategoryName = function(group){
        return $ctrl.Categories[group.CategoryId].CategoryName;
    };
    $ctrl.markerIcon = function(group){
        return '/markers/' + $ctrl.Markers[group.MarkerId].IconUrl;
    };
    $ctrl.newGroup = function(parentSelector){
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'newGroup.html',
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

    $ctrl.deleteGroup = function(category){
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'deleteCategory.html',
            controller: 'deleteCategoryController',
            controllerAs: '$ctrl',
            size: "md",
            resolve: {
                categoryToDelete: function () {
                    return category;
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

falloutApp.controller('newGroupController', ['$uibModalInstance', 'mapDataService', function($uibModalInstance, mapDataService) {
    var $ctrl = this;
    $ctrl.groupName = "";
    $ctrl.categoryId = 0;
    $ctrl.markerId = 0;
    $ctrl.Markers = mapDataService.markersLookup;
    $ctrl.Categories = mapDataService.categoriesLookup;
    $ctrl.getIcon = function(){
        return '/markers/' + $ctrl.Markers[$ctrl.markerId].IconUrl;
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

falloutApp.controller('updateGroupController', ['$uibModalInstance', 'mapDataService', 'groupToUpdate', function($uibModalInstance, mapDataService, groupToUpdate) {
    var $ctrl = this;
    $ctrl.groupName = groupToUpdate.GroupName;
    $ctrl.categoryId = groupToUpdate.CategoryId;
    $ctrl.markerId = groupToUpdate.MarkerId;
    $ctrl.Markers = mapDataService.markersLookup;
    $ctrl.Categories = mapDataService.categoriesLookup;
    $ctrl.getIcon = function(){
        return '/markers/' + $ctrl.Markers[$ctrl.markerId].IconUrl;
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

falloutApp.controller('DeleteGroupController', ['$uibModalInstance', 'mapDataService', function($uibModalInstance, mapDataService) {
    var $ctrl = this;
    $ctrl.groupName = "";
    $ctrl.category = {};
    $ctrl.groupMarker = {};

    $ctrl.ok = function () {
        mapDataService.addCategory($ctrl.categoryName);
        $uibModalInstance.close({
        });
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);