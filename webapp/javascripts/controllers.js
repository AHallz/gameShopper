//The rest of the website for voting controller
angular.module('gameStorePages', [])
.config(['$locationProvider', function($locationProvider){
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });   
}])
.controller('gameStoreController', ['$scope', '$http', '$location', function($scope, $http, $location){
    //variables for use in the front view
    $scope.currFormData = [];
    $scope.adminStatus = false;
    $scope.gamesData = [];
    $scope.orderHistoryData = [];
    $scope.storesData = [];
    $scope.storeStockData = [];


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

    //games table functions
    $scope.getAllGames = function(){
        $http.post('/db/getAllGames')
        .success(function(data){
            $scope.gamesData = data;
        })
        .error(function(error){
            console.log('Error: ' + error);
        });
    }
    $scope.getGameById = function(){
        $http.post('/db/getAllGames', $scope.currFormData) //currFormData is whatever the form on the page is
        .success(function(data){
            $scope.gamesData = data;
        })
        .error(function(error){
            console.log('Error: ' + error);
        });
    }
    $scope.addGame = function(){
        console.log($scope.currFormData.cost);
        console.log($scope.currFormData.title);
        $http.post('/db/addGame/', $scope.currFormData)
        .success(function(data, status){
            $scope.currFormData =[];
            $scope.dataForm.$setPristine();
            $scope.gamesData = data;
        })
        .error(function(error){
            console.log('Error: ' + error);
        });
    }
    //order_history table functions
    $scope.getAllOrderHistory = function(){
        $http.post('/db/getAllOrderHistory')
        .success(function(data){
            $scope.orderHistoryData = data;
        })
        .error(function(error){
            console.log('Error: ' + error);
        });
    }
    //stores table functions
    $scope.getAllStores = function(){
        $http.post('/db/getAllStores')
        .success(function(data){
            $scope.storesData = data;
        })
        .error(function(error){
            console.log('Error: ' + error);
        });
    }
    //store_stock table functions
    $scope.getAllStoreStock = function(){
        $http.post('/db/getAllStoreStock')
        .success(function(data){
            $scope.storeStockData = data;
        })
        .error(function(error){
            console.log('Error: ' + error);
        });
    }



}]);