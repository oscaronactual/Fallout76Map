falloutApp.controller('categoriesController', ['$uibModalInstance', 'mapDataService', '$document','$uibModal', function($uibModalInstance, mapDataService, $document,$uibModal) {
    var $ctrl = this;
    $ctrl.categoryName = "blah blah bhlah";
    $ctrl.categories = mapDataService.categories;
    $ctrl.newCategory = function(parentSelector){
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'newCategory.html',
            backdrop: 'static',
            controller: 'newCategoryController',
            controllerAs: '$ctrl',
            size: "md"
        });
    };
    $ctrl.updateCategory = function(category){
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'updateCategory.html',
            backdrop: 'static',
            controller: 'updateCategoryController',
            controllerAs: '$ctrl',
            size: "md",
            resolve: {
                categoryToEdit: function () {
                    return category;
                }
            }
        });
    };

    $ctrl.deleteCategory = function(category){
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'deleteCategory.html',
            backdrop: 'static',
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

falloutApp.controller('newCategoryController', ['$uibModalInstance', 'mapDataService', function($uibModalInstance, mapDataService) {
    var $ctrl = this;
    $ctrl.categoryName = "";

    $ctrl.ok = function () {
        mapDataService.addCategory($ctrl.categoryName);
        $uibModalInstance.close({
        });
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);

falloutApp.controller('updateCategoryController', ['$uibModalInstance', 'mapDataService', 'categoryToEdit', function($uibModalInstance, mapDataService, categoryToEdit) {
    var $ctrl = this;

    $ctrl.categoryName = categoryToEdit.CategoryName;

    $ctrl.ok = function () {
        categoryToEdit.CategoryName = $ctrl.categoryName;
        mapDataService.updateCategory(categoryToEdit);
        $uibModalInstance.close({
        });
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);

falloutApp.controller('deleteCategoryController', ['$uibModalInstance', 'mapDataService', 'categoryToDelete', function($uibModalInstance, mapDataService, categoryToDelete) {
    var $ctrl = this;

    $ctrl.categoryName = categoryToDelete.CategoryName;

    $ctrl.ok = function () {
        mapDataService.deleteCategory(categoryToDelete);
        $uibModalInstance.close({
        });
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);
