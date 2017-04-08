//The rest of the website for voting controller
angular.module('gameStorePages', [])
.config(['$locationProvider', function($locationProvider){
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });   
}])
.controller('gameStoreController', ['$scope', '$http', '$location', '$window', function($scope, $http, $location, $window){
    //variables for use in the front view
    $scope.adminStatus = false;

    $scope.adminStatus = function(){
        $http.get('/adminStatus')
        .success(function(data){
            if(data){
                $scope.adminStatus = data;
            }
            else{
                $scope.adminStatus = false;
            }
        });
    }
}]);