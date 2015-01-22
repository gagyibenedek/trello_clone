angular.module('trello', ['firebase']);

angular.module('trello').controller('MainController', ['$scope', 'dataAccessFactory',
  function ($scope, dataAccessFactory) {
    $scope.list = dataAccessFactory.createNewList();
    $scope.list.title = "I'm a list!";
}]);