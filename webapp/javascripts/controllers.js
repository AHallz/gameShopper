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
    $scope.storesAndStockData = [];


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
        $http({
            method: 'POST',
            url: "/db/addGame",           
            params: $scope.currFormData,
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
        }).success(function(data, status){
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

    $scope.addStore = function(){
        console.log($scope.currFormData.name);
        console.log($scope.currFormData.location);
        $http({
            method: 'POST',
            url: "/db/addStore",           
            params: $scope.currFormData,
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
        }).success(function(data, status){
            $scope.currFormData =[];
            $scope.dataForm.$setPristine();
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

    $scope.getStoresAndStock = function(){
        $http.post('/db/getStoresAndStock')
        .success(function(data){
            $scope.storeAndStockData = data;
        })
        .error(function(error){
            console.log('Error: ' + error);
        });
    }

    $scope.deleteItem = function(table,itemId){
        $http.post('/db/deleteItem/' + table + '/' + itemId)
            .success(function(data,status) {
                console.log("Delted some stuff");
                if(table == 1)
                    $scope.getAllGames();
                else if(table == 2)
                    $scope.getAllOrderHistory();
                //DEAL WITH THIS LATER
                else if(table == 3)
                    $scope.getAllStores();
                //^^^^^^^^^^^^^^^^^^^^^^^^^^
                else if(table == 4)
                    $scope.getAllStoreStock();
            })
            .error(function(error) {
                console.log('Error: ' + error);
            });
    }

    $scope.deleteStoreItem = function(table,itemId){
        $http.post('/db/deleteStoreItem/' + gameId + '/' + storeId)
            .success(function(data,status) {
                console.log("Delted some stuff");
                    $scope.getStoresAndStock();
            })
            .error(function(error) {
                console.log('Error: ' + error);
            });
    }

}]);