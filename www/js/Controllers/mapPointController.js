falloutApp.controller('mapPointController', ['$scope', 'localStorageService',
    function($scope, localStorageService) {
    $scope.toggleFound = function(){
        $scope.point.isFound = !$scope.point.isFound;
        setLocalStorageValues();
        $scope.point.opacity = $scope.point.isFound ? 0.5 : 1.0 ;
    };

    function setLocalStorageValues(){
        var pointFind = localStorageService.get('pointsFound');
        if (! pointFind){
            localStorageService.set('pointsFound', []);
            pointFind = localStorageService.get('pointsFound');
        }

        if($scope.point.isFound){
            if(!pointFind.includes($scope.point.Id)){
                pointFind.push($scope.point.Id);
                localStorageService.set('pointsFound', pointFind);
            }
        }else{
            var index = pointFind.findIndex(function(element){
                return element === $scope.point.Id;
            });
            pointFind.splice(index, 1);
            localStorageService.set('pointsFound', pointFind);
        }
    }
}]);