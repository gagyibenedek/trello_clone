angular.module('trello', ['firebase']);

angular.module('trello').controller('MainController', ['$scope', 'dataAccessFactory',
  function ($scope, dataAccessFactory) {
    $scope.lists = dataAccessFactory.getLists();
    $scope.cards = dataAccessFactory.getCards();

    $scope.addList = function(){
      dataAccessFactory.addList();
    }
}]);